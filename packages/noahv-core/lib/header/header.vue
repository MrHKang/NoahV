<template>
    <div class="noahv-layout">
        <div class="noahv-layout-header">
            <div class="noahv-layout-header-inner">
                <div>
                    <Logo :logo="logo"></Logo>
                    <div v-if="navsHide" class="noahv-layout-nav-wrapper">
                        <ul class="noahv-layout-nav clearfixs">
                            <li v-for="(item, key) in menu" :data-id="item.id">
                                <headerLink :item="item"></headerLink>
                            </li>
                        </ul>
                        <div class="noahv-layout-nav-more" v-show="moreMenu.length > 0">
                            <div class="more-dot" title="更多">...</div>
                            <ul class="more-list clearfixs">
                                <li v-for="(item, key) in moreMenu">
                                    <headerLink :moreMenu="true" :item="item"></headerLink>
                                </li>
                            </ul>
                        </div>
                        <Login :login="login"></Login>
                    </div>
                </div>
            </div>
        </div>
        <div class="noahv-layout-content">
            <router-view name="sidebar" v-show="hasSidebar" :routerConfig="routerConf" :sidebarConfig="sidebarConfig"></router-view>
            <div class="noahv-layout-content-inner" :class="{'noahv-layout-content-inner-has-aside': hasSidebar}">
                <div class="noahv-layout-breadcrumb" v-if="hasBread">
                    <Breadcrumb :separator="separatorString">
                        <template v-for="(item, index) in breadcrumb">
                            <BreadcrumbItem>{{item}}</BreadcrumbItem>
                        </template>
                    </Breadcrumb>
                </div>
                <div class="noahv-layout-content-main">
                    <router-view></router-view>
                </div>
            </div>
        </div>
        <router-view name="footer"/>
    </div>
</template>
<script>
import $ from 'jquery';
import _ from 'lodash';

import Logo from './logo';
import Login from './login';
import headerLink from './headerLink';


export default {
    name: 'sa-header',
    props: [
        'unSelectedItem',
        'getCurrentItem',
        'linkInHeader',
        'headerConf',
        'login',
        'hasBread',
        'logo',
        'routerConf',
        'separator',
        'sidebarConfig',
        'routerMap',
        'getTargetInHeader'
    ],
    components: {
        headerLink,
        Logo,
        Login
    },

    data() {
        return {
            navsHide: true,
            breadcrumb: [],
            isShow: false,
            hasSidebar: false,
            separatorString: this.separator ? this.separator : '/',
            menu: this.headerConf ? this.headerConf : [],
            moreMenu: []
        };
    },
    created() {
        this.routerChange();
    },
    mounted() {
        this.$nextTick(() => {
            // 默认执行
            this.caclNavWidth();
            // resize window执行
            window.addEventListener('resize', this.caclNavWidth, false);                     
        });
    },
    destroyed() {
        window.removeEventListener('resize', this.caclNavWidth, false);
    },
    watch: {
        '$route': 'routerChange'
    },
    methods: {
        routerChange() {
            const path = this.$route.path;
            // inHeader descript if not this path in header or sidebar
            const inHeader = this.linkInHeader(path, this.routerConf);
            if (!inHeader) {
                this.updateByNotInHeader(path);
            }
            else {
                this.updateByInHeader(path);
            }
            this.hasSidebarByRouter();
        },
        /**
         * 判断当前路由是否配置了侧导航
         * 
         */
        hasSidebarByRouter() {
            const path = this.$route.path;
            this.hasSidebar = false;
            this.routerConf.forEach(item => {
                if (item.components) {
                    if (item.path === path && item.components.sidebar) {
                        this.hasSidebar = true;
                    }
                }
            });
        },
        /**
         * 当前路由不在导航中的情况下，根据mata配置更新导航状态及面包屑
         * 
         * @param {String} path 当前路由
         */
        updateByNotInHeader(path) {
            this.breadcrumb = [];
            const meta = this.$route.meta || {};
            
            // 没有配置root或sidebarRoot时，匹配空串
            // 可以短路面包屑添加头部和侧导航label的逻辑
            this.setHeaderSelect(meta.root || '');
            this.setSidebarSelect(path, meta.sidebarRoot || '');

            for (let router of this.routerConf) {
                if (router.path === path && router.meta && router.meta.breadcrumb) {
                    this.breadcrumb.push(router.meta.breadcrumb);
                    break;
                }
            }
        },
        /**
         * 当前路由不在导航中的情况下，根据mata配置设置头部导航
         * 
         * @param {String} metaRoot 当前路由指向的头部导航link
         */
        setHeaderSelect(metaRoot) {
            _.each(this.menu, item => {
                this.$set(item, 'selected', metaRoot === item.key);
                if (metaRoot === item.key) {
                    this.breadcrumb.push(item.label);
                }
            });
        },
        /**
         * 当前路由不在导航中的情况下，根据mata配置设置面包屑
         * 导航状态的更新逻辑在sidebar中完成
         * 
         * @param {String} path 当前路由
         * @param {String} metaSidebarRoot 当前路由指向的侧导航link
         */
        setSidebarSelect(path, metaSidebarRoot) {
            if (this.sidebarConfig && metaSidebarRoot) {
                const config = this.sidebarConfig[path];
                if (config && config.menu) {
                    _.each(config.menu, item => {
                        if (item.type === 'item') {
                            if (metaSidebarRoot === item.key) {
                                this.breadcrumb.push(item.label);
                            }
                        }
                        else if (item.type === 'subItem') {
                            for (let subItem of item.children) {
                                if (metaSidebarRoot === subItem.key) {
                                    this.breadcrumb.push(item.label);
                                    this.breadcrumb.push(subItem.label);
                                }
                            }
                        }
                    });
                }
            }            
        },
        /**
         * 当前路由在导航中的情况下，更新导航状态及面包屑
         * 
         * @param {String} path 当前路由
         */
        updateByInHeader(path) {
            this.breadcrumb = [];
            this.updateHeaderSelect(path);
            this.updateSidebarSelect(path);
        },
        /**
         * 当前路由在导航中的情况下，更新头部导航状态
         * 
         * @param {String} path 当前路由
         */
        updateHeaderSelect(path) {
            if (this.routerMap) {
                const routerMap = this.routerMap[path] || {};
                _.each(this.menu, item => {
                    this.$set(item, 'selected', routerMap.headerRoot === item.key);
                    if (routerMap.headerRoot === item.key) {
                        this.breadcrumb.push(item.label);
                    }
                });
            }
            else {
                _.each(this.menu, item => {
                    this.$set(item, 'selected', path === item.link);
                    if (path === item.link) {
                        this.breadcrumb.push(item.label);
                    }
                });
            }
        },
        /**
         * 当前路由在导航中的情况下，更新面包屑
         * 导航状态的更新逻辑在sidebar中完成
         * 
         * @param {String} path 当前路由
         */
        updateSidebarSelect(path) {
            if (!this.sidebarConfig) {
                return;
            }

            const config = this.sidebarConfig[path];

            if (config && config.menu) {
                _.each(config.menu, item => {
                    if (item.type === 'item') {
                        if (path === item.link) {
                            this.breadcrumb.push(item.label);
                        }
                    }
                    else if (item.type === 'subItem') {
                        for (let subItem of item.children) {
                            if (path === subItem.link) {
                                this.breadcrumb.push(item.label);
                                this.breadcrumb.push(subItem.label);
                            }
                        }
                    }
                });
            }
        },
        /**
         * 根据id查找当前的menu
         * 
         * @param {String} id 当前菜单的id
         */
        getMenuById(id) {
            const hasFive = false;
            this.menu.map((item, i) => {
                if (id === item.id) {
                    this.moreMenu.push(item);
                }              
            });
        },
        /**
         * nav宽度重计算
         */
        caclNavWidth() {
            const nav = $('.noahv-layout-nav');
            const logo = $('.noahv-layout-logo').outerWidth();
            const navLeft = parseInt(nav.css('marginLeft'), 10);
            const navRight = parseInt(nav.css('marginRight'), 10);
            const more = $('.noahv-layout-nav-more').width();

            nav.width($(window).width() - logo - navLeft - navRight - more - 120);
           
            this.moreMenu = [];

            [...$('.noahv-layout-nav li')].map((item, i) => {
                const top = $(item).offset().top;
                const id = $(item).attr('data-id');

                if (top > 0) {
                    this.getMenuById(id);
                }
            });
        }
    }
};
</script>
