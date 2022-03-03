import {refreshNode} from './render.js'
const ArrayProto = Array.prototype;
let proxyArray =  [];
/**
 * nameSpace用来查找预渲染中索引关系。
 * @param {Sue} vm 
 * @param {*} target 
 * @param {string} nameSpace 
 */
 function proxy(vm,target,nameSpace){
    let proxyObject = null;
    let flag1 = target instanceof Object;
    let flag2 = target instanceof Array;
    flag1 && !flag2 && (proxyObject = proxyObj(vm,target,nameSpace));
    flag2 && (proxyObject = proxyArr(vm,target,nameSpace));
    return proxyObject;
  }
  function proxyObj(vm,target,nameSpace){
    let result = {};
    let proxyList = [result,vm];
    proxyList.map( value => {
      defines(vm,value,target,nameSpace);
    })
    return result;
  }
  function defines(vm,val,target,nameSpace){
    for(let [key,value] of Object.entries(target)){
      // 如果value是对象类型必须深度代理
      const flag = Array.isArray(value);
      !flag && Object.defineProperty(val,key,{
        set(value){
          // 实现双向绑定
            target[key] = value;
          // 重新渲染节点
          refreshNode(vm,getNameSpace(nameSpace,key));
        },
        get(){
          //这里不能写成value，如果写成value修改之后无法自动更新
          return target[key];
        }
      })
      // flag && !temp &&(temp = proxy(vm,value,getNameSpace(nameSpace,key)));
      // val[key] = temp;如果不把proxyArray的结果设置成全局会导致两个代理对象不是同一个
      flag && (val[key] = proxy(vm,value,getNameSpace(nameSpace,key)));
    }
  }
  // 
  //让属性代理到真正的层级上而不是全部挂到vm上
  function proxyArr(vm,target,nameSpace){
    // 主要需要代理数组的方法，
    
    // 如果数组中有对象需要代理
    for(let i = 0;i<target.length;i++){
      proxyArray[i] = typeof target[i] === 'object' ? proxy(vm,target[i],nameSpace) : target[i];
    }
    // 代理数组原型上的方法
    proxyArray.__proto__ = updataProto(vm,target,nameSpace);
    return proxyArray;
  }
  function updataProto(vm,target,nameSpace){
    let wraperMethods = ['push','pop','shift','unshift'];
    let newProto = {
      eleType:'Array',
      tag:'llshi'
    };
    proxyMethod.call(vm,newProto,wraperMethods,nameSpace);
    target._proto_ = newProto;
    return newProto;
  }
  function proxyMethod(newProto,methods,nameSpace){
    let _vm = this;
    for(let method of methods){
      Object.defineProperty(newProto,method,{
        enumerable:true,
        configurable:true,
        value:function(...args){
          let orign = ArrayProto[method];
          const result = orign.apply(this,args);//谁调用this指向谁。
          console.log('我是新的数组方法,我要重新渲染节点了');
          refreshNode(_vm,nameSpace);
          return result;
        }
      })
    }
  }
  function getNameSpace(nowNameSpace,key){
    let result = undefined;
    (nowNameSpace == null || nowNameSpace == '') && (result = key);
    (key == null || key == '') && (result = nowNameSpace);
    nowNameSpace && key && (result = `${nowNameSpace}.${key}`);
    return result;
  }
// function add2vm(vm,nameSpace,proxyArr){
//     const nameList = nameSpace.split('.');
//     let target = vm;
//     for(let key of nameList){
//         target[key] ? target = vm[key] : target[key] = proxyArr;
//     }
// }
export {proxy}