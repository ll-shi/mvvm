import {Vnode} from '../vdom/Vnode.js'
import {prepareRender} from './render.js'
function mount(vm,el){
    // 创建虚拟dom树
    vm._vtree = initVtree(vm,el,null);
    // 进行预渲染建立索引关系。
    prepareRender(vm,vm._vtree);
}
function mixinMount(Sue){
    Sue.prototype.$mount = function(el){
        const vm = this;
        const root = document.querySelector(el);
        mount(vm,root); 
    }
}
/**
 * 用来创建虚拟dom树
 * @param {Sue} vm Sue
 * @param {dom} elm 真实dom
 * @param {dom} parent elm父节点
 */
function initVtree(vm,elm,parent){
    let children = [];
    let nodeType = elm.nodeType;
    let tag = elm.nodeName;
    let text = getNodeText(elm);
    let data = undefined;
    let key = undefined;
    // 创建虚拟根节点
    let vnode = new Vnode(tag,elm,children,text,parent,nodeType,data,key);
    // 对chilren虚拟节点进行初始化,以及进行深度搜索创建dom树。
    // 把伪数组变成真数组。
    let childs = [...elm.childNodes];
    childs && childs.map( child => {
        let childNode = initVtree(vm, child, vnode);
        children.push(childNode);
    });
    return vnode;
}
/**
 * 注意只有文本节点里面才有文本
 * @param {dom} elm 
 */
function getNodeText(elm){
    return elm.nodeType === 3 ? elm.nodeValue : '';
}
export {mount,mixinMount}