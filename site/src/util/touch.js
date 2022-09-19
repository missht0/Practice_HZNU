


const SWIPE_BLOCK_ELEMS = [
  'swipBlock',
  'handle',
  'drag-ruble'
]

let xDown = null;
let yDown = null; 
let xDiff = null;
let yDiff = null;
let timeDown = null;
const  TIME_THRESHOLD = 200;
const  DIFF_THRESHOLD = 50;


let containsClassName = (evntarget , classArr) => {
 for (var i = classArr.length - 1; i >= 0; i--) {
   if( evntarget.classList.contains(classArr[i]) ) {
      return true;
    }
  }
}

export let handleTouchStart = (evt) => {
  let touchStartTarget = evt.target;
  if( containsClassName(touchStartTarget, SWIPE_BLOCK_ELEMS) ) {
    return;
  }
  timeDown = Date.now()
  xDown = evt.touches[0].clientX;
  yDown = evt.touches[0].clientY;
  xDiff = 0;
  yDiff = 0;

}

export let handleTouchMove = (evt) => {
  if (!xDown || !yDown) {
    return;
  }
  var xUp = evt.touches[0].clientX;
  var yUp = evt.touches[0].clientY;
  xDiff = xDown - xUp;
  yDiff = yDown - yUp;
  // console.log(yUp)
}


export let handleTouchEnd = (callbak,evt) => {
  let timeDiff = Date.now() - timeDown; 
  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    if (Math.abs(xDiff) > DIFF_THRESHOLD && timeDiff < TIME_THRESHOLD) {
      if (xDiff > 0) {
        /* left swipe */
      } else {
        /* right swipe */
        callbak()
      }
    } else {
      // console.log('swipeX trashhold')
    }
  } 
  xDown = null;
  yDown = null;
  timeDown = null; 
}