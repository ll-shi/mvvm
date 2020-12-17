let temp2vnode = new Map();
let vnode2temp = new Map();
/**
 * 建立索引关系，为重新渲染节点节点做准备
 * @param {Sue} vm 
 * @param {vnode} vnode
 */
function prepareRender(vm,vnode){
    const {nodeType,children} = (vnode ?? {});
    nodeType === 3 && analysisTempStr(vnode);
    children && children.map( child => {
        prepareRender(vm,child);    
    })
}
/**
 * 根据映射关系重新渲染节点。
 * @param {Sue} vm 
 * @param {vnode} vnode 
 */
function refreshNode(vm,temp){
    const vnodes = temp2vnode.get(temp);
    vnodes && vnodes.map( vnode => {
        renderNode(vm,vnode);
    })
}
/**
 * 根据索引关系渲染节点
 * @param {Sue} vm 
 * @param {vnode} vnode 
 */
function renderNode(vm,vnode){
    const handle = () =>{
        const tempRes = vnode2temp.get(vnode);
        tempRes && (() => {
            let result = vnode.text;
            for(let temp of tempRes){
                // 注意scope数组书写顺序
                let tempValue = getTempValue([vm.env,vm._data],temp);
                result = simplefly(result);
                // 对模版字符串进行替换。
                tempValue && (result = result.replace(`{{${temp}}}`,tempValue));
            }
            vnode.elm.nodeValue = result;
        })()
    };
    const next = () =>{
        const { children } = vnode;
        children && children.map( child => {
            renderNode(vm,child);
        })
    }
    vnode.nodeType === 3 ? handle() : next();
}
function simplefly(str){
    const result =  str && str.match(/{{(\s)*[A-Za-z0-9._]+(\s)*}}/g);
    result && result.map( item => {
        const temp = item.substring(2,item.length-2).trim();
        str = str.replace(item,`{{${temp}}}`);
    })
    return str;
}
function getTempValue(scopes,temp){
    // 考虑要不要使用eval来执行表达式。
    // 防止temp中有person.name的情况,也有可能没点
    const tempList = temp.split('.');
    let result = undefined;
    for(const scope of scopes){
        result = getValue(scope,tempList)
        if(result){
            return result;
        }
    }
    return result;
}
function getValue(scope,tempList){
    let temp = scope;
    tempList.map( key => {
        scope && (temp = temp[key])
    }) 
    return temp;
}
function mixinRender(Sue){
    Sue.prototype._render = function(){
        renderNode(this,this._vtree);
    }
}
function analysisTempStr(vnode){
    // 建立索引关系。
    const tempStrResult = vnode.text.match(/{{(\s)*[A-Za-z0-9._]+(\s)*}}/g);
    tempStrResult && tempStrResult.map( result => {
        result = parseTemp(result);
        initTemp2vnode(result,vnode);
        initVnode2temp(result,vnode);
    })
}
function parseTemp(temp){
    return temp.substring(2,temp.length-2).trim();
}
function initTemp2vnode(temp,vnode){
    const result = temp2vnode.get(temp);
    result ? result.push(vnode) : temp2vnode.set(temp,[vnode]);
}
function initVnode2temp(temp,vnode){
    const result = vnode2temp.get(vnode);
    result ? result.push(temp) : vnode2temp.set(vnode,[temp]);
}
export {prepareRender,mixinRender,refreshNode};