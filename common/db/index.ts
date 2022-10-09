import DB from '../utils/dbUtil' // 引入indexedDB工具类
import userObjectStore from './objectStores/user' // 引入用户信息对象仓库
import orderObjectStore from './objectStores/order' // 引入订单记录对象仓库
import recordObjectStore from './objectStores/record' // 引入浏览记录对象仓库

// 数据库
export const airbnbDB = new DB('airbnb')

export function initDB() {
  airbnbDB
    .openStore({
      ...userObjectStore,
      ...orderObjectStore,
      ...recordObjectStore
    })
    .then((res: any) => {
      console.log('初始化所有对象仓库', res)
    })
    .catch(e => {
      console.error(e)
    })
}
