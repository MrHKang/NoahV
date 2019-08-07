/**
 * @file sidebar router config
 *
 * @author MrHKang(nimingdexiaohai@163.com)
 */

export default {
    /**
     * @param {Boolean} exg                为true时，scope可支持正则匹配
     * @param {Array}   scope              指定config生效的作用域，可以是router中配置的任意项的link字段组合
     * @param {Array}   config.openNames   侧导航中一级菜单
     * @param {String}  config.activeName  指定侧导航中默认展开的一级菜单
     * @param {Array}   config.menu        侧导航配置，最多支持二级菜单配置
     *                  - type             菜单项类型，item代表只有一级菜单，subItem代表有二级菜单，详见下述示例
     *                  - label            菜单项名称
     *                  - key              菜单项唯一标示
     *                  - iconType         菜单项图标，支持NoahV-Icon
     *                  - link             菜单项路由，当只有一级菜单时配置
     *                  - children         二级子菜单项配置，其中link字段支持同域内跳转，target字段支持跨域跳转
     *                
     */
    sidebarConfig: [
        {
            scope: ['/tableDemo', '/formDemo', '/filterTableDemo', '/trendDemo', '/chartDemo'],
            config: {
                openNames: ['tableKindDemo', 'chartKindDemo'],
                activeName: 'tableKindDemo',
                menu: [
                    {
                        type: 'subItem',
                        label: '表类示例',
                        key: 'tableKindDemo',
                        iconType: 'table',
                        children: [
                            {
                                label: '表格示例',
                                key: 'tableDemo',
                                link: '/tableDemo'
                            },
                            {
                                label: '表单示例',
                                key: 'formDemo',
                                link: '/formDemo'
                            },
                            {
                                label: '筛选表格示例',
                                key: 'filterTableDemo',
                                link: '/filterTableDemo'
                            }
                        ]
                    },
                    {
                        type: 'subItem',
                        label: '图类示例',
                        key: 'chartKindDemo',
                        iconType: 'pie',
                        children: [
                            {
                                label: '趋势图示例',
                                key: 'trendDemo',
                                link: '/trendDemo'
                            },
                            {
                                label: '多图示例',
                                key: 'chartDemo',
                                link: '/chartDemo'
                            }
                        ]
                    }
                ]
            }
        },
        {
            // 支持正则匹配
            exg: true,
            scope: ['^\/theme\/'],
            config: {
                openNames: ['buttonDemo', 'themeTableDemo', 'inputDemo', 'checkboxDemo', 'radioDemo',
                'toastDemo', 'tooltipDemo', 'modalDemo', 'tabDemo', 'pageDemo', 'selectDemo', 'switchDemo'],
                activeName: 'buttonDemo',
                menu: [
                    {
                        type: 'item',
                        label: '按钮示例',
                        key: 'buttonDemo',
                        link: '/theme/button',
                        iconType: 'angle-right-square'
                    },
                    {
                        type: 'item',
                        label: '列表示例',
                        key: 'themeTableDemo',
                        link: '/theme/table',
                        iconType: 'table'
                    },
                    {
                        type: 'item',
                        label: '输入框示例',
                        key: 'inputDemo',
                        link: '/theme/input',
                        iconType: 'pencil'
                    },
                    {
                        type: 'item',
                        label: '复选框示例',
                        key: 'checkboxDemo',
                        link: '/theme/checkbox',
                        iconType: 'check-square'
                    },
                    {
                        type: 'item',
                        label: '单选框示例',
                        key: 'radioDemo',
                        link: '/theme/radio',
                        iconType: 'dot-circle-o'
                    },
                    {
                        type: 'item',
                        label: '警示示例',
                        key: 'toastDemo',
                        link: '/theme/toast',
                        iconType: 'warning-circle'
                    },
                    {
                        type: 'item',
                        label: '提示信息示例',
                        key: 'tooltipDemo',
                        link: '/theme/tooltip',
                        iconType: 'question-circle'
                    },
                    {
                        type: 'item',
                        label: '模态框示例',
                        key: 'modalDemo',
                        link: '/theme/modal',
                        iconType: 'th-large'
                    },
                    {
                        type: 'item',
                        label: '选项卡示例',
                        key: 'tabDemo',
                        link: '/theme/tabs',
                        iconType: 'application'
                    },
                    {
                        type: 'item',
                        label: '分页器示例',
                        key: 'pageDemo',
                        link: '/theme/page',
                        iconType: 'file'
                    },
                    {
                        type: 'item',
                        label: '选择框示例',
                        key: 'selectDemo',
                        link: '/theme/select',
                        iconType: 'list'
                    },
                    {
                        type: 'item',
                        label: '开关示例',
                        key: 'switchDemo',
                        link: '/theme/switch',
                        iconType: 'start-circle'
                    }
                ]
            }
        }
    ]
};
