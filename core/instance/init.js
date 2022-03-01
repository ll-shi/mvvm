import {proxy} from './proxy.js'
import {mount} from './mount.js'
let uid=0;
function mixinInit(Sue){
    Sue.prototype._init = function(options){
        console.log('开始进行初始化了');
        const vm = this;
        vm.uid = uid++;
        vm._isSue = true;
        vm._data = options && options.data && proxy(vm,options.data,'');
        options && options.el && mount(vm,document.querySelector(options.el)); 
    }
}
export {mixinInit}