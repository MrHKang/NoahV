/**
 * NoahV
 * Copyright (c) 2016 Baidu, Inc. All Rights Reserved.
 *
 * @file noahv core util
 * @author darren(darrenywyu@gmail.com)
 *         MrHKang(nimingdexiaohai@163.com)
 */

import Vue from 'vue';
import VueRouter from 'vue-router';
import invariant from 'invariant';
import _ from 'lodash';
import tongji from '@baidu/noahv-tongji';

import headerApp from './header/header';
import routerHandler from './router';
import headerHandler from './header';


let noahv = {};

/**
 * render APP
 *
 * @param  {string} container dom to render
 * @param  {Object} noahv     noahv object
 * @param  {Object} store     data store
 */
function render(container, noahv, store) {
    noahv.vueInstance = new Vue({
        router: noahv._router,
        store: store || {}
    }).$mount(container);
}

/**
 * entry for project
 *
 * @param  {string} container dom to render app
 * @param  {Object} store  data store
 * @return {Object} vue instance
 */
const start = (container, store) => {
    // container是字符串
    if (typeof container === 'string') {
        let isContainer = document.querySelector(container);
        invariant(
            isContainer,
            `[noahv.start] container ${container} not found`
        );
    }
    // 路由必须提前注册
    invariant(
        noahv._router,
        '[noahv.start] router must be registered before noahv.start()'
    );

    if (container) {
        render(container, noahv, store);
        return noahv.vueInstance;
    }
};

/**
 * create router for project
 *
 * @param {Object} routerConfig router config for project
 * @param {Object} sidebarConfig sidebar config for project
 */
const router = (routerConfig, sidebarConfig) => {
    invariant(
        routerConfig instanceof Array,
        `[noahv.router] router should be Array, but got ${typeof router}`
    );
    let routerInstance = routerHandler(noahv, routerConfig, sidebarConfig);
    let routes = routerInstance;

    // 处理全局header
    if (noahv._header) {
        // 处理自定义footer情况，只有使用系统提供布局才使用noahv._header中的footer配置
        if (noahv._footer) {
            _.each(routerInstance, (item, index) => {
                if (item.components) {
                    routerInstance[index].components.footer = noahv._footer;
                }
                else if (item.component) {
                    routerInstance[index].components = {
                        default: item.component,
                        footer: noahv._footer
                    };
                    delete routerInstance[index].component;
                }
            });
        }
        _.extend(noahv._headerConf, {
            routerConf: routerConfig
        });

        routes = [
            {
                path: '/',
                component: noahv._header,
                children: routerInstance,
                props: noahv._headerConf ? noahv._headerConf : {}
            }
        ];
    }
    else if (noahv._layout) {
        routes = [
            {
                path: '/',
                component: noahv._layout,
                children: routerInstance
            }
        ];
    }
    noahv._router = new VueRouter({
        routes
    });
};

/**
 * 使用系统提供布局，默认没有footer,如需要，可以在创建布局的时候传入
 *
 * @param  {Object} config 布局配置
 * @param  {Object} footer footer APP
 */
const layout = (config, footer) => {
    invariant(
        !noahv._router,
        '[noahv.layout] layout must be registered before noahv.router()'
    );
    noahv._headerConf = headerHandler(config);
    noahv._header = headerApp;
    if (footer) {
        noahv._footer = footer;
    }
};

/**
 * init APP by custome layout
 *
 * @param  {Object} layout custome layout APP
 */
const useLayout = layout => {
    invariant(
        !noahv._router,
        '[noahv.useHeader] useheader must be registered before noahv.router()'
    );
    invariant(
        !noahv._layout,
        '[noahv.useHeader] useheader & header can only registered once'
    );
    noahv._layout = layout;
};

/**
 * 嵌入百度统计功能
 *
 * @param  {String} accountId 统计账户标识
 */
const track = accountId => {
    tongji.setAccount(accountId);
    // 初始化百度统计用全局数组
    if (!window._hmt) {
        window._hmt = [];
    }
    invariant(
        noahv._router,
        '[noahv.track] track should be registered after noahv.router()'
    );
    noahv._router.beforeEach((to, from, next) => {
        if (to.path) {
            if (window._hmt) {
                window._hmt.push(['_trackPageview', '/#' + to.fullPath]);
            }
        }
        next();
    });
};

noahv.router = router;
noahv.layout = layout;
noahv.start = start;
noahv.useLayout = useLayout;
noahv.useBaiduTrack = track;

export default noahv;
