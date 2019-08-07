<template>
    <div class="noahv-layout-aside">
        <Menu :ref="id" :active-name="activeName" width="auto" :open-names="openNames">
            <template v-for="(item, index) in menu">
                <template v-if="item.type === 'item'">
                    <MenuItem :name="item.key">
                        <router-link v-if="item.link" :to="item.link">
                            <template v-if="item.iconType">
                                <nv-icon :type="item.iconType" />
                            </template>                             
                            <span class="noahv-layout-text">{{item.label}}</span> 
                        </router-link>
                        <a v-if="item.target" :href="item.target">
                            <template v-if="item.iconType">
                                <nv-icon :type="item.iconType" />
                            </template>                             
                            <span class="noahv-layout-text">{{item.label}}</span>
                        </a>
                    </MenuItem>
                </template>
                <template v-if="item.type === 'subItem'">
                    <Submenu :name="item.key">
                        <template slot="title">
                            <template v-if="item.iconType">
                                <nv-icon :type="item.iconType" />
                            </template>
                            <span class="noahv-layout-text">{{item.label}}</span> 
                        </template>
                        <template v-for="(subItem, subIndex) in item.children">
                            <MenuItem :name="item.key + '-' + subItem.key" style="padding-left:0;">
                                <router-link v-if="subItem.link" :to="subItem.link">
                                    <template v-if="subItem.iconType">
                                        <nv-icon :type="subItem.iconType" />
                                    </template>                             
                                    <span class="noahv-layout-text">{{subItem.label}}</span> 
                                </router-link>
                                <a v-if="subItem.target" :href="subItem.target">
                                    <template v-if="subItem.iconType">
                                        <nv-icon :type="subItem.iconType" />
                                    </template>                             
                                    <span class="noahv-layout-text">{{subItem.label}}</span>
                                </a>
                            </MenuItem>
                        </template> 
                    </Submenu>
                </template>
            </template>
        </Menu>
        <div class="bottom-nav" @click="IcontoggleClick">
            <div class="text">收起导航</div>
            <div class="icons">
                <nv-icon :type="btnNavIcon" />
            </div>
        </div>
    </div>
</template>

<script>
import $ from 'jquery';
import u from 'underscore';


const asideShort = 'noahv-layout-aside-short';
const content = 'noahv-layout-content-inner';
const contentShort = 'noahv-layout-content-inner-has-aside-short';

export default {
    name: 'sidebar',
    props: [
       'sidebarConfig',
       'routerConfig'
    ],
    data() {
        return {
            id: '',
            btnNavIcon: 'fold',
            openNames: [],
            activeName: [],
            menu: []
        };
    },
    watch: {
        '$route': 'routerChange'
    },
    created() {
        this.id = 'sidebarMenu_' + Math.random().toString().replace('\.', '');
        this.routerChange();  
    },
    methods: {
        IcontoggleClick() {
            $(this.$el).toggleClass(asideShort);

            this.btnNavIcon = (this.btnNavIcon === 'fold') ? 'unfold' : 'fold';
            const root = $(this.$root.$el);
            this.$nextTick(function() {
                $(root).find('.' + content).toggleClass(contentShort);
            });
        },
        routerChange() {
            let path = this.$route.path;

            if (path && this.sidebarConfig[path]) {
                let config = this.sidebarConfig[path];
                this.openNames = config.openNames || [];
                this.activeName = config.activeName || '';
                this.menu = config.menu || [];
            }

            this.activeName = '';
            if (this.menu.length) {
                this.$nextTick(function() {
                    this.updateMenuStatus(this.menu, path);
                });
            }
        },
        /**
         * set menu item active when it's path or it's meta.sidebarRoot
         * equal to currentRouter.path
         *
         * @param {Object} menu route config
         * @param {Object} currentPath current router path
         */
        updateMenuStatus(menu, currentPath) {
            let findActive = this.updateMenuInSidebar(menu, currentPath);
            if (!findActive) {
                this.updateMenuNotInSidebar(menu, currentPath);
            }
        },
        /**
         * set menu item active when it's router.path
         * equal to currentRouter.path
         *
         * @param {Object} menu route config
         * @param {Object} currentPath current router path
         */
        updateMenuInSidebar(menu, currentPath) {
            let activeUpdated = false;
            for (let item of menu) {
                if (currentPath === item.link) {
                    this.activeName = item.key;
                    this.openNames = [item.key];
                    activeUpdated = true;
                    break;
                }
                if (item.children) {
                    for (let subItem of item.children) {
                        if (currentPath === subItem.link) {
                            this.activeName = item.key + '-' + subItem.key;
                            this.openNames = [item.key];
                            activeUpdated = true;
                            break;
                        }
                    }
                    if (activeUpdated) {
                        break;
                    }
                }
            }
            this.$nextTick(() => {
                this.$refs[this.id].updateOpened();
            });
            return activeUpdated;
        },
        /**
         * If no path equal to currentRouter.path,
         * to find is there exist sidebarRoot matched.
         * The path has higher priority than meta.sidebarRoot,
         * so this ergodic logic can not merge with the updateMenuInSidebar function.
         *
         * @param {Object} menu route config
         * @param {Object} currentPath current router path
         */
        updateMenuNotInSidebar(menu, currentPath) {
            let activeUpdated = false;
            for (let item of menu) {
                if (!activeUpdated) {
                    let router = this.getSidebarRoot(currentPath, this.routerConfig);
                    if (router && router.meta.sidebarRoot === item.key) {
                        this.activeName = item.key;
                        this.openNames = [item.key];
                        activeUpdated = true;
                        break;
                    }
                    if (item.children) {
                        for (let subItem of item.children) {
                            let router = this.getSidebarRoot(currentPath, this.routerConfig);
                            if (router && router.meta.sidebarRoot === subItem.key) {
                                this.activeName = item.key + '-' + router.meta.sidebarRoot;
                                this.openNames = [item.key];
                                activeUpdated = true;
                                break;
                            }
                        }
                        if (activeUpdated) {
                            break;
                        }
                    }
                }
            }
        },
        getSidebarRoot(path, routerConfig) {
            for (let router of routerConfig) {
                if (path === router.path && router.meta && router.meta.sidebarRoot) {
                    return router;
                }
            }
        }
    }
};
</script>
