import {mixinInit} from './init.js'
function Sue(options){
    this._init(options);
}
mixinInit(Sue);
export {Sue}