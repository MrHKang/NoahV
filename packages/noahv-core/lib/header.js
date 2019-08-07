/**
 * NoahV
 * Copyright (c) 2016 Baidu, Inc. All Rights Reserved.
 *
 * @file header render
 * @author darren(darrenywyu@gmail.com)
 *         Joannamo(joannamo123@163.com)
 *         MrHKang(nimingdexiaohai@163.com)
 */

const headerHanlder = config => {
    const {header, login, hasBread} = config;

    // default hasBread
    let hasBreadSource = hasBread !== false;


    // the headerMap array
    let headerMap = [];
    let redirectRouter = '';

    function getRandomId() {
        return new Date().getTime() + Math.random().toString().replace(/\./g, '_');
    }

    function getHeaderMap(headers) {
        if (Array.isArray(headers)) {
            headers.forEach(item => {
                if (typeof item.parent === 'undefined') {
                    item.parent = null;
                }
                item.id = item.id ? item.id : getRandomId();
                headerMap.push(item);

                if (item.children) {
                    item.children.forEach(chItem => {
                        chItem.parent = item.key;
                        chItem.id = chItem.id ? chItem.id : getRandomId();
                        return null;
                    });

                    getHeaderMap(item.children);
                }
            });
        }
    }

    getHeaderMap(header);
    getHeaderMap(login.subnav);

    const getCurrentItem = (key, value) => {
        let res = {};
        headerMap.forEach(item => {
            if (item[key] && item[key] === value) {
                res = item;
            }
        });

        return res;
    };

    const unSelectedItem = item => {
        item.forEach(curItem => {
            curItem.selected = false;
            if (curItem.children) {
                unSelectedItem(curItem.children);
            }
        });
    };

    const linkInHeader = (path, routerConfig) => {
        let inHeader = true;
        for (let router of routerConfig) {
            if (router.path === path && router.meta && router.meta.root) {
                inHeader = false;
                break;
            }
        }
        
        return inHeader;
    };

    const addSelectedProperty = header => {
        header.forEach(item => {
            if (typeof item.selected === 'undefined') {
                item.selected = false;

                if (item.children) {
                    addSelectedProperty(item.children);
                }
            }
        });
    };

    addSelectedProperty(header);

    function getRedirectRouter(data) {
        data.forEach(item => {
            if (item.selected) {
                if (!item.children) {
                    redirectRouter = item.link;
                }
                else {
                    getRedirectRouter(item.children);
                }
            }
        });
    }

    getRedirectRouter(header);

    function getTargetInHeader(link) {
        let it = getCurrentItem('link', link);
        while (it.parent) {
            it = getCurrentItem('key', it.parent);
        }
        return it;
    }

    return {
        login: config.login,
        headerConf: config.header,
        logo: config.logo,
        hasBread: hasBreadSource,
        separator: config.separator,
        getCurrentItem: getCurrentItem,
        unSelectedItem: unSelectedItem,
        linkInHeader: linkInHeader,
        getTargetInHeader: getTargetInHeader
    };

};

export default headerHanlder;
