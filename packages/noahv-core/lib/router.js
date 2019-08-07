/**
 * NoahV
 * Copyright (c) 2016 Baidu, Inc. All Rights Reserved.
 *
 * @file router handler
 * @author darren(darrenywyu@gmail.com)
 *         Joannamo(joannamo123@163.com)
 *         MrHKang(nimingdexiaohai@163.com)
 */

import _ from 'lodash';

/* eslint-disable no-undef,func-names */
function getComponent(path) {
    let fileType = 'vue';
    if ((/^\/.*/).test(path)) {
        path = path.replace(/^\//, '');
    }
    if ((/^\.\/.*/).test(path)) {
        path = path.replace(/^\.\//, '');
    }
    if ((/^src.*/).test(path)) {
        path = path.replace('src/', '');
    }
    if ((/\./).test(path)) {
        fileType = path.match(/\.(\S*)$/)[1];
        let suffix = path.match(/\.(\S*)$/)[0];
        path = path.replace(suffix, '');
    }
    if (fileType === 'vue') {
        return resolve => {
            return require.ensure(
                [],
                function () {
                    return resolve(require('src/' + path + '.vue'));
                }
            );
        };
    }
    else if (fileType === 'md') {
        return resolve => {
            return require.ensure(
                [],
                function () {
                    return resolve(require('src/' + path + '.md'));
                }
            );
        };
    }
}

function isObject(obj) {
    return obj instanceof Object && typeof obj !== 'function';
}

function autoMatch(expression, routerConfig, menuConfig) {
    let matched = {};
    let pattern = new RegExp(expression.toString());
    _.each(routerConfig, item => {
        const isMatch = pattern.test(item.path);
        if (isMatch) {
            matched[item.path] = menuConfig;
        }
    });
    return matched;
}

/**
 * extend router when sidebarConfig setted
 *
 * Note: the router of item.target should be dealed in target page
 * just need to deal with item.link which can cover all condition
 */
function extendConfig(noahv, routerConfig, sidebarConfig) {
    let sidePath = [];
    let sideConfig = {};
    let autoMatched = {};

    _.each(sidebarConfig, item => {
        if (item.scope && item.config) {
            let scope = item.scope || [];
            for (let link of scope) {
                if (item.exg) {
                    autoMatched = Object.assign({}, autoMatched, autoMatch(link, routerConfig, item.config));
                }
                else {
                    sidePath.push(link);
                    sideConfig[link] = item.config;
                }
            }
        }
    });

    _.each(autoMatched, (value, key) => {
        if (sidePath.indexOf(key) === -1) {
            sidePath.push(key);
            sideConfig[key] = value;
        }
    });

    _.each(routerConfig, item => {
        if (sidePath.indexOf(item.path) > -1) {
            item.components = item.components ? item.components : (item.component ? {'default': item.component} : {});
            item.components['sidebar'] = item.components['sidebar'] ? item.components['sidebar'] : r => require.ensure([], () => r(require('./sidebar/sidebar')), 'sidebar');

            delete item['component'];
        }
    });

    noahv._headerConf.sidebarPath = sidePath;
    noahv._headerConf.sidebarConfig = sideConfig;

    return routerConfig;
}

/**
 * build router map to set parent
 *
 */
function buildRouterMap(noahv, routerConfig) {
    let headerConfig = noahv._headerConf.headerConf || [];
    let sidebarConfig = noahv._headerConf.sidebarConfig || [];
    let routerMap = {};
    
    let sidebarKeyMap = {};
    for (let item of Object.values(sidebarConfig)) {
        for (let menuItem of item.menu) {
            if (menuItem.type === 'item') {
                sidebarKeyMap[menuItem.key] = chunck(sidebarConfig[menuItem.link].menu, 'link');
            }
            else if (menuItem.type === 'subItem' && menuItem.children) {
                for (let subItem of menuItem.children) {
                    sidebarKeyMap[subItem.key] = chunck(sidebarConfig[subItem.link].menu, 'link');
                }
            }
        }
    }

    _.each(routerConfig, item => {
        let sidebarRoot = findSidebarRoot(item, sidebarConfig);
        let headerRoot = findHeaderRoot(item, headerConfig, sidebarRoot, sidebarKeyMap);
        routerMap[item.path] = {
            'headerRoot': headerRoot,
            'sidebarRoot': sidebarRoot
        };
    });

    noahv._headerConf.routerMap = routerMap;
}

function findHeaderRoot(router, headerConfig, sidebarRoot, sidebarKeyMap) {
    if (router.meta && router.meta.root) {
        return router.meta.root;
    }
    for (let headerItem of headerConfig) {
        if (headerItem.link === router.path) {
            return headerItem.key;
        }
    }

    for (let headerItem of headerConfig) {
        if (sidebarKeyMap[sidebarRoot] && sidebarKeyMap[sidebarRoot].indexOf(headerItem.link) > -1) {
            return headerItem.key;
        }
    }

    return '';
}

function findSidebarRoot(router, sidebarConfig) {
    if (router.meta && router.meta.sidebarRoot) {
        return router.meta.sidebarRoot;
    }
    if (Object.keys(sidebarConfig).indexOf(router.path) > -1) {
        let menu = sidebarConfig[router.path].menu || [];
        for (let menuItem of menu) {
            if (menuItem.type === 'item' && menuItem.link === router.path) {
                return menuItem.key;
            }
            else if (menuItem.type === 'subItem' && menuItem.children) {
                let index = _.findIndex(menuItem.children, ['link', router.path]);
                if (index > -1) {
                    return menuItem.children[index]['key'];
                }
            }
        }
    }
    return '';
}

function chunck(list, key) {
    let result = [];
    for (let item of list) {
        if (item.type === 'item') {
            result.push(item[key]);
        }
        else if (item.type === 'subItem' && item.children) {
            for (let subItem of item.children) {
                result.push(subItem[key]);
            }
        }
    }
    return result;
}

const router = function (noahv, routerConfig, sidebarConfig) {
    let routers = [];
    let entry = '';
    // 装填sidebar
    if (sidebarConfig && sidebarConfig.sidebarConfig && sidebarConfig.sidebarConfig.length) {
        routerConfig = extendConfig(noahv, routerConfig, sidebarConfig.sidebarConfig);
        buildRouterMap(noahv, routerConfig);
    }

    _.each(routerConfig, function (item) {
        let temp = {};
        // 处理components写法
        if (item.components && isObject(item.components)) {
            let component = {};
            _.each(item.components, function (value, key) {
                component[key] = typeof value === 'string' ? getComponent(value) : value;
            });
            temp = {
                path: item.path,
                components: component
            };
        }
        // 处理component写法
        else if (item.component && isObject(item.component)) {
            let component = {};
            _.each(item.component, function (value, key) {
                component[key] = typeof value === 'string' ? getComponent(value) : value;
            });
            temp = {
                path: item.path,
                components: component
            };
        }
        else {
            temp = {
                path: item.path,
                component: typeof item.component === 'string' ? getComponent(item.component) : item.component
            };
        }
        // 处理chidren情况
        if (item.children !== undefined) {
            if (typeof item.children === 'string') {
                temp.children = getComponent(item.children);
            }
            else {
                temp.children = item.children;
            }
        }
        if (item.meta) {
            temp.meta = item.meta;
        }

        // 判断是否配置了入口
        if (item.entry === true) {
            entry = item.path;
        }
        routers.push(temp);
    });

    if (entry === '') {
        entry = routerConfig[0].path;
    }

    // 配置默认跳转
    routers.unshift({
        path: '',
        redirect: entry
    });
    return routers;
};
/* eslint-enable */
export default router;
