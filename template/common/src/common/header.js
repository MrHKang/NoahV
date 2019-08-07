/**
 * @file header config
 * @author MrHKang(nimingdexiaohai@163.com)
 */

export default {
    header: [
        {
            label: '图表示例',
            key: 'templateDemo',
            link: '/tableDemo',
        },
        {
            label: '组件示例',
            key: 'componentDemo',
            link: '/theme/button'
        }
    ],
    hasBread: true,
    logo: {
        // 是否需要logo
        hasLogo: true,
        title: 'NoahV',
        // eslint-disable-next-line no-undef
        src: require('common/assets/img/logo.png')
    },
    login: {
        hasLogin: true,
        url: '/api/user',
        logout: '/api/logout',
        subnav: [
            {
                key: 'baidu',
                label: '百度',
                linkTarget: 'https://www.baidu.com'
            },
            {
                key: 'baiducloud',
                label: '百度云',
                linkTarget: 'https://cloud.baidu.com'
            },
        ]
    },
    type: 'header',
    separator: '/'
};
