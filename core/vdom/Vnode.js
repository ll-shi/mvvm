// 虚拟节点
class Vnode{
    constructor(tag,elm,children,text,parent,nodeType,data,key){
        this.tag = tag;
        this.elm = elm;
        this.children = children;
        this.text = text;
        this.parent = parent;
        this.nodeType = nodeType;
        this.data = data;
        this.env = {};
        this.key = key;
        this.instruction = undefined;
        this.temp = [];
    }
}

export {Vnode}