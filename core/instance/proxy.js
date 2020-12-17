import {refreshNode} from './render.js'
const ArrayProto = Array.prototype;
/**
 * nameSpace用来查找预渲染中索引关系。
 * @param {Sue} vm 
 * @param {*} target 
 * @param {string} nameSpace 
 */
function proxy(vm,target,nameSpace){
    let proxyObject = null;
    const flag1 = target instanceof Object;
    const flag2 = target instanceof Array;
    flag1 && !flag2 && (proxyObject = proxyObj(vm,target,nameSpace));
    flag2 && (proxyObject = proxyArr(vm,target,nameSpace));
    return proxyObject;
}
function proxyObj(vm,target,nameSpace){
    let result = {};
    for(let [key,value] of Object.entries(target)){
        Object.defineProperty(result,key,{
            set(value){
                console.log(key);
                target[key] = value;
                console.log('我要重新渲染节点了');
                refreshNode(vm,getNameSpace(nameSpace,key))
            },
            get(){
                return target[key];
            }
        });
        // 优化体验在vm上也代理data中的数据。
        const flag = typeof value !== 'object';
        flag && Object.defineProperty(getReal(vm,nameSpace),key,{
            configurable: true,
            set(value){
                target[key] = value;
                console.log('我要重新渲染节点了');
                refreshNode(vm,getNameSpace(nameSpace,key));
            },
            get(){
                return target[key];
            }
        });
        !flag && (value = proxy(vm,value,getNameSpace(nameSpace,key)));
    }
    return result;
}
function proxyArr(vm,target,nameSpace){
    let proxyArr = new Array(target.length);
    for(let i = 0; i < target.length; i++){
        proxyArr[i] = typeof target[i] === 'object' ? proxy(vm,target[i],nameSpace) : target[i]; 
    }
    // 代理数组原型上的方法。
    proxyArr = updataProto(vm,target,nameSpace);
    // 把代理对象添加到vm上
    add2vm(vm,nameSpace,proxyArr);
    return proxyArr;
}
function getReal(vm,nameSpace){
    let result = nameSpace ? vm[nameSpace] : vm;
    !result && (vm[nameSpace] = {},result = vm[nameSpace]);
    return result;
}
function getNameSpace(nowNameSpace,key){
    let result = undefined;
    (nowNameSpace == null || nowNameSpace === '') && (result = key);
    (key == null || key === '') && (result = nowNameSpace);
    nowNameSpace && key && (result = `${nowNameSpace}.${key}`);
    return result;
}
function updataProto(vm,target,nameSpace){
    let wraperMehoods = ['push','pop','shift','unshift'];
    let newProto = {
        eleTyep : 'Array',
    };
    // wraperMehoods.map( method => { newProto[method] = function(){} })
    proxyMethod.call(vm,newProto,wraperMehoods,nameSpace);
    target.__proto__ = newProto;
    return target;
}
function proxyMethod(newProto,methods,nameSpace){
    let _vm = this;
    for(let method of methods){
        Object.defineProperty(newProto,method,{
            enumerable: true,
            configurable: true,
            value: function(...args){
                let origin = ArrayProto[method];
                const result = origin.apply(this,args);
                console.log('我要准备渲染了');
                console.log(_vm);
                refreshNode(_vm,nameSpace);
                return result;
            }
        })
    }
}
function add2vm(vm,nameSpace,proxyArr){
    const nameList = nameSpace.split('.');
    let target = vm;
    for(let key of nameList){
        target[key] ? target = vm[key] : target[key] = proxyArr;
    }
}
export {proxy}