import {mixinInit} from './init.js'
import {mixinMount} from './mount.js'
import {mixinRender} from './render.js'
function Sue(options){
    this._init(options);
    this._render();
}
mixinInit(Sue);
mixinMount(Sue);
mixinRender(Sue)
export {Sue}