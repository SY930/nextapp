const routes = [
    {
        path: '/',
    },
    // {
    //     path: '/child',
    //     children: [
    //         {
    //             path: '/child2',
    //             children: [],
    //         },
    //     ],
    // },
    // {
    //     path: '/test',
    // }
];
function loadRotes(routes, withPath = '') {
    return routes.reduce((pre, cur) => {
        if (cur.children && cur.children.length){
            const routeList = loadRotes(cur.children, withPath + cur.path);
            pre = [...pre, ...routeList];
        }
        pre.push(withPath + cur.path);
        return pre;
    }, [])
}
const routeList = loadRotes(routes);
module.exports = routeList;