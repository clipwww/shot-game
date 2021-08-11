import "regenerator-runtime/runtime";
import dayjs from 'dayjs';

import { ShotGame } from '../dist/index'

window.addEventListener('orientationchange', () => {
  window.location.reload();
})
if (!!window.orientation || window.innerHeight <  window.innerWidth) {
  alert('請以直立手機的方式進行遊玩。')
}

(async function() {
  const shotGame = await new ShotGame({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    superManSpriteFolderPath: '',
  }).init();

}())

