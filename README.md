# 小慕读书后台管理系统   -- 基于vue-element-admin

## 登录流程

1. 项目启动完成后，进入/根路径， / 重定向到 /dashboard
2. 触发全局路由钩子函数beforeEach， 在钩子函数中先判断 有没有 token
    有token, 表示已经登录过了， 如果 to.path === '/login'， 重定向到 / 
                            如果to.path 为其他值，判断当前的角色有没有该路由的访问权限 -> 4
    没有token，表示第一次登录， 判断请求路径是否在白名单中，不是的话就重定向到 `/login?redirect=${to.path}` -> 3

3. 登录流程处理， 用户输入用户名，密码进行登陆后，后端验证成功后会返回数据， 此时将返回回的数据中的token存储到vuex和cookie中
   登录成功后进入  `/login?redirect=${to.path}`  的to.path路径， 即进行登录操作后会跳转到之前访问的页面

4. 从Vuex中判断有没有权限 hasRoles = store.getters.roles && store.getters.roles.length > 0，
    如果hasRoles为false， 则向后端请求用户信息获取用户的信息， 获取成功后将用户的信息存入vuex
    即表示用户成功登录后，需要根据token去获取用户的信息。
    
    获取到用户的权限之后，根据用户权限生成动态路由 ，使用 router.addRoutes动态添加路由  -> 5

  如果有权限， next()

5. 生成动态路由 在定义路由表的时候，定义一张 constantRoutes  表示固定路由，所有人都可以访问的路由
                              一张 asyncRoutes 只有符合权限的人才能访问， 返回符合权限的路由信息， 将这些信息保存在vuex中，供侧边栏渲染
                              使用 router.addRoutes动态的将这些符合权限的路由添加进去