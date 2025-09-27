/** @license
 * DHTML Snowstorm! JavaScript-based snow for web pages
 * Making it snow on the internets since 2003. You're welcome.
 * -----------------------------------------------------------
 * Version 1.44.20131208 (Previous rev: 1.44.20131125)
 * Copyright (c) 2007, Scott Schiller. All rights reserved.
 * Code provided under the BSD License
 * http://schillmania.com/projects/snowstorm/license.txt
 */


var snowStorm = (function(window, document) {

  // Prima lettura (potrebbe essere aggiornata prima dell'effettivo start)
  var cfg = window && window.artsnowstormConfig ? window.artsnowstormConfig : {};

  // --- default configurabili via window.artsnowstormConfig ---
  this.autoStart = (typeof cfg.autoStart !== 'undefined') ? cfg.autoStart : true;
  this.excludeMobile = (typeof cfg.excludeMobile !== 'undefined') ? cfg.excludeMobile : true;
  this.flakesMax = (typeof cfg.flakesMax !== 'undefined') ? cfg.flakesMax : 128;
  this.flakesMaxActive = (typeof cfg.flakesMaxActive !== 'undefined') ? cfg.flakesMaxActive : 64;
  this.animationInterval = (typeof cfg.animationInterval !== 'undefined') ? cfg.animationInterval : 20;
  this.useGPU = (typeof cfg.useGPU !== 'undefined') ? cfg.useGPU : true;
  this.className = (typeof cfg.className !== 'undefined') ? cfg.className : null;
  this.flakeBottom = (typeof cfg.flakeBottom !== 'undefined') ? cfg.flakeBottom : null;
  this.followMouse = (typeof cfg.followMouse !== 'undefined') ? cfg.followMouse : true;
  this.snowColor = (typeof cfg.snowColor !== 'undefined') ? cfg.snowColor : '#fff';
  this.snowCharacter = (typeof cfg.snowCharacter !== 'undefined') ? cfg.snowCharacter : '&bull;';
  this.snowStick = (typeof cfg.snowStick !== 'undefined') ? cfg.snowStick : true;
  this.targetElement = (typeof cfg.targetElement !== 'undefined') ? cfg.targetElement : null;
  this.useMeltEffect = (typeof cfg.useMeltEffect !== 'undefined') ? cfg.useMeltEffect : true;
  this.useTwinkleEffect = (typeof cfg.useTwinkleEffect !== 'undefined') ? cfg.useTwinkleEffect : false;
  this.usePositionFixed = (typeof cfg.usePositionFixed !== 'undefined') ? cfg.usePositionFixed : false;
  this.usePixelPosition = (typeof cfg.usePixelPosition !== 'undefined') ? cfg.usePixelPosition : false;

  // meno usati
  this.freezeOnBlur = (typeof cfg.freezeOnBlur !== 'undefined') ? cfg.freezeOnBlur : true;
  this.flakeLeftOffset = (typeof cfg.flakeLeftOffset !== 'undefined') ? cfg.flakeLeftOffset : 0;
  this.flakeRightOffset = (typeof cfg.flakeRightOffset !== 'undefined') ? cfg.flakeRightOffset : 0;
  // Qui le dimensioni dei fiocchi vengono lette dalla config se presenti
  this.flakeWidth = (typeof cfg.flakeWidth !== 'undefined') ? cfg.flakeWidth : 20;
  this.flakeHeight = (typeof cfg.flakeHeight !== 'undefined') ? cfg.flakeHeight : 20;
  this.vMaxX = (typeof cfg.vMaxX !== 'undefined') ? cfg.vMaxX : 5;
  this.vMaxY = (typeof cfg.vMaxY !== 'undefined') ? cfg.vMaxY : 4;
  this.zIndex = (typeof cfg.zIndex !== 'undefined') ? cfg.zIndex : 9000;

  // fine defaults
  var storm = this,
    features,
    isIE = navigator.userAgent.match(/msie/i),
    isIE6 = navigator.userAgent.match(/msie 6/i),
    isMobile = navigator.userAgent.match(/mobile|opera m(ob|in)/i),
    isBackCompatIE = (isIE && document.compatMode === 'BackCompat'),
    noFixed = (isBackCompatIE || isIE6),
    screenX = null, screenX2 = null, screenY = null, scrollY = null, docHeight = null, vRndX = null, vRndY = null,
    windOffset = 1,
    windMultiplier = 2,
    flakeTypes = 6,
    fixedForEverything = false,
    targetElementIsRelative = false,
    opacitySupported = (function(){
      try {
        document.createElement('div').style.opacity = '0.5';
      } catch(e) {
        return false;
      }
      return true;
    }()),
    didInit = false,
    docFrag = document.createDocumentFragment();

  // Funzione per (ri)applicare la config al runtime: utile se JSON viene cambiato prima dello start
  function applyConfigObject(c) {
    if (!c || typeof c !== 'object') return;
    // proprietà significative che possono essere aggiornate
    if (typeof c.followMouse !== 'undefined') storm.followMouse = !!c.followMouse;
    if (typeof c.useTwinkleEffect !== 'undefined') storm.useTwinkleEffect = !!c.useTwinkleEffect;
    if (typeof c.snowColor !== 'undefined') storm.snowColor = c.snowColor;
    if (typeof c.flakeWidth !== 'undefined') storm.flakeWidth = parseInt(c.flakeWidth,10) || storm.flakeWidth;
    if (typeof c.flakeHeight !== 'undefined') storm.flakeHeight = parseInt(c.flakeHeight,10) || storm.flakeHeight;
    if (typeof c.flakesMax !== 'undefined') storm.flakesMax = parseInt(c.flakesMax,10) || storm.flakesMax;
    if (typeof c.flakesMaxActive !== 'undefined') storm.flakesMaxActive = parseInt(c.flakesMaxActive,10) || storm.flakesMaxActive;
    if (typeof c.snowStick !== 'undefined') storm.snowStick = !!c.snowStick;
    if (typeof c.excludeMobile !== 'undefined') storm.excludeMobile = !!c.excludeMobile;
    // zIndex e velocità utili
    if (typeof c.zIndex !== 'undefined') storm.zIndex = parseInt(c.zIndex,10) || storm.zIndex;
    if (typeof c.vMaxX !== 'undefined') storm.vMaxX = parseFloat(c.vMaxX) || storm.vMaxX;
    if (typeof c.vMaxY !== 'undefined') storm.vMaxY = parseFloat(c.vMaxY) || storm.vMaxY;
  }

  // Applica immediatamente la config se presente
  applyConfigObject(window && window.artsnowstormConfig ? window.artsnowstormConfig : null);

  features = (function() {
    var getAnimationFrame;
    function timeoutShim(callback) {
      window.setTimeout(callback, 1000/(storm.animationInterval || 20));
    }
    var _animationFrame = (window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      timeoutShim);

    getAnimationFrame = _animationFrame ? function() {
      return _animationFrame.apply(window, arguments);
    } : null;

    var testDiv = document.createElement('div');

    function has(prop) {
      var result = testDiv.style[prop];
      return (result !== undefined ? prop : null);
    }

    var localFeatures = {
      transform: {
        ie:  has('-ms-transform'),
        moz: has('MozTransform'),
        opera: has('OTransform'),
        webkit: has('webkitTransform'),
        w3: has('transform'),
        prop: null
      },
      getAnimationFrame: getAnimationFrame
    };

    localFeatures.transform.prop = (
      localFeatures.transform.w3 ||
      localFeatures.transform.moz ||
      localFeatures.transform.webkit ||
      localFeatures.transform.ie ||
      localFeatures.transform.opera
    );

    testDiv = null;
    return localFeatures;
  }());

  this.timer = null;
  this.flakes = [];
  this.disabled = false;
  this.active = false;
  this.meltFrameCount = 20;
  this.meltFrames = [];

  this.setXY = function(o, x, y) {
    if (!o) return false;
    if (storm.usePixelPosition || targetElementIsRelative) {
      o.style.left = (x - storm.flakeWidth) + 'px';
      o.style.top = (y - storm.flakeHeight) + 'px';
    } else if (noFixed) {
      o.style.right = (100-(x/screenX*100)) + '%';
      o.style.top = (Math.min(y, docHeight-storm.flakeHeight)) + 'px';
    } else {
      if (!storm.flakeBottom) {
        o.style.right = (100-(x/screenX*100)) + '%';
        o.style.bottom = (100-(y/screenY*100)) + '%';
      } else {
        o.style.right = (100-(x/screenX*100)) + '%';
        o.style.top = (Math.min(y, docHeight-storm.flakeHeight)) + 'px';
      }
    }
  };

  this.events = (function() {
    var old = (!window.addEventListener && window.attachEvent), slice = Array.prototype.slice,
      evt = {
        add: (old?'attachEvent':'addEventListener'),
        remove: (old?'detachEvent':'removeEventListener')
      };

    function getArgs(oArgs) {
      var args = slice.call(oArgs), len = args.length;
      if (old) {
        args[1] = 'on' + args[1];
        if (len > 3) args.pop();
      } else if (len === 3) {
        args.push(false);
      }
      return args;
    }

    function apply(args, sType) {
      var element = args.shift(), method = [evt[sType]];
      if (old) {
        element[method](args[0], args[1]);
      } else {
        element[method].apply(element, args);
      }
    }

    function addEvent() { apply(getArgs(arguments), 'add'); }
    function removeEvent() { apply(getArgs(arguments), 'remove'); }

    return { add: addEvent, remove: removeEvent };
  }());

  function rnd(n,min) {
    if (isNaN(min)) min = 0;
    return (Math.random()*n)+min;
  }

  function plusMinus(n) {
    return (parseInt(rnd(2),10)===1?n*-1:n);
  }

  this.randomizeWind = function() {
    var i;
    vRndX = plusMinus(rnd(storm.vMaxX,0.2));
    vRndY = rnd(storm.vMaxY,0.2);
    if (this.flakes) {
      for (i=0; i<this.flakes.length; i++) {
        if (this.flakes[i].active) {
          this.flakes[i].setVelocities();
        }
      }
    }
  };

  this.scrollHandler = function() {
    var i;
    scrollY = (storm.flakeBottom ? 0 : parseInt(window.scrollY || document.documentElement.scrollTop || (noFixed ? document.body.scrollTop : 0), 10));
    if (isNaN(scrollY)) scrollY = 0;
    if (!fixedForEverything && !storm.flakeBottom && storm.flakes) {
      for (i=0; i<storm.flakes.length; i++) {
        if (storm.flakes[i].active === 0) {
          storm.flakes[i].stick();
        }
      }
    }
  };

  this.resizeHandler = function() {
    if (window.innerWidth || window.innerHeight) {
      screenX = window.innerWidth - 16 - storm.flakeRightOffset;
      screenY = (storm.flakeBottom || window.innerHeight);
    } else {
      screenX = (document.documentElement.clientWidth || document.body.clientWidth || document.body.scrollWidth) - (!isIE ? 8 : 0) - storm.flakeRightOffset;
      screenY = storm.flakeBottom || document.documentElement.clientHeight || document.body.clientHeight || document.body.scrollHeight;
    }
    docHeight = document.body.offsetHeight;
    screenX2 = parseInt(screenX/2,10);
  };

  this.resizeHandlerAlt = function() {
    screenX = storm.targetElement.offsetWidth - storm.flakeRightOffset;
    screenY = storm.flakeBottom || storm.targetElement.offsetHeight;
    screenX2 = parseInt(screenX/2,10);
    docHeight = document.body.offsetHeight;
  };

  this.freeze = function() {
    if (!storm.disabled) {
      storm.disabled = 1;
    } else {
      return false;
    }
    storm.timer = null;
  };

  this.resume = function() {
    if (storm.disabled) storm.disabled = 0; else return false;
    storm.timerInit();
  };

  this.toggleSnow = function() {
    if (!storm.flakes.length) {
      storm.start();
    } else {
      storm.active = !storm.active;
      if (storm.active) { storm.show(); storm.resume(); }
      else { storm.stop(); storm.freeze(); }
    }
  };

  this.stop = function() {
    var i;
    this.freeze();
    for (i=0; i<this.flakes.length; i++) {
      this.flakes[i].o.style.display = 'none';
    }
    storm.events.remove(window,'scroll',storm.scrollHandler);
    storm.events.remove(window,'resize',storm.resizeHandler);
    if (storm.freezeOnBlur) {
      if (isIE) {
        storm.events.remove(document,'focusout',storm.freeze);
        storm.events.remove(document,'focusin',storm.resume);
      } else {
        storm.events.remove(window,'blur',storm.freeze);
        storm.events.remove(window,'focus',storm.resume);
      }
    }
  };

  this.show = function() {
    var i;
    for (i=0; i<this.flakes.length; i++) {
      this.flakes[i].o.style.display = 'block';
    }
  };

  this.SnowFlake = function(type,x,y) {
    var s = this;
    this.type = type;
    this.x = x||parseInt(rnd(screenX-20),10);
    this.y = (!isNaN(y)?y:-rnd(screenY)-12);
    this.vX = null;
    this.vY = null;
    this.vAmpTypes = [1,1.2,1.4,1.6,1.8];
    this.vAmp = this.vAmpTypes[this.type] || 1;
    this.melting = false;
    this.meltFrameCount = storm.meltFrameCount;
    this.meltFrames = storm.meltFrames;
    this.meltFrame = 0;
    this.twinkleFrame = 0;
    this.active = 1;

    // Visual size variabile: base derivata da storm.flakeHeight, influenzata dal tipo + jitter casuale
    var baseFactor = 0.6 + (this.type / (flakeTypes - 1 || 1)) * 0.4; // tipo influisce leggermente
    var jitter = (Math.random() * 0.4) - 0.2; // +/-20%
    var rawFactor = baseFactor + jitter;
    rawFactor = Math.max(0.5, Math.min(1.4, rawFactor)); // limiti ragionevoli
    this.visualSize = Math.max(8, Math.round(storm.flakeHeight * rawFactor));

    // Calcola font-size coerente con la visualSize
    this.fontSize = Math.max(8, Math.min(this.visualSize - 2, Math.round(this.visualSize * 0.6)));

    this.o = document.createElement('div');
    this.o.innerHTML = storm.snowCharacter;
    if (storm.className) this.o.setAttribute('class', storm.className);
    this.o.style.color = storm.snowColor;
    this.o.style.position = (fixedForEverything?'fixed':'absolute');

    if (storm.useGPU && features.transform.prop) {
      this.o.style[features.transform.prop] = 'translate3d(0px, 0px, 0px)';
    }

    // Applica dimensioni visive con !important per sovrascrivere CSS esterni
    this.o.style.setProperty('width', this.visualSize + 'px', 'important');
    this.o.style.setProperty('height', this.visualSize + 'px', 'important');
    this.o.style.fontFamily = 'arial,verdana';
    this.o.style.cursor = 'default';
    this.o.style.overflow = 'hidden';
    this.o.style.fontWeight = 'normal';
    this.o.style.zIndex = storm.zIndex;
    this.o.style.setProperty('font-size', this.fontSize + 'px', 'important');
    this.o.style.setProperty('line-height', this.visualSize + 'px', 'important');
    this.o.style.textAlign = 'center';
    this.o.style.verticalAlign = 'baseline';
    docFrag.appendChild(this.o);

    this.refresh = function() {
      if (isNaN(s.x) || isNaN(s.y)) return false;
      storm.setXY(s.o, s.x, s.y);
    };

    this.stick = function() {
      if (noFixed || (storm.targetElement !== document.documentElement && storm.targetElement !== document.body)) {
        s.o.style.top = (screenY+scrollY-storm.flakeHeight)+'px';
      } else if (storm.flakeBottom) {
        s.o.style.top = storm.flakeBottom+'px';
      } else {
        s.o.style.display = 'none';
        s.o.style.bottom = '0%';
        s.o.style.position = 'fixed';
        s.o.style.display = 'block';
      }
    };

    this.vCheck = function() {
      if (s.vX>=0 && s.vX<0.2) s.vX = 0.2;
      else if (s.vX<0 && s.vX>-0.2) s.vX = -0.2;
      if (s.vY>=0 && s.vY<0.2) s.vY = 0.2;
    };

    this.move = function() {
      var vX = s.vX*windOffset, yDiff;
      s.x += vX;
      s.y += (s.vY*s.vAmp);
      if (s.x >= screenX || screenX-s.x < storm.flakeWidth) {
        s.x = 0;
      } else if (vX < 0 && s.x-storm.flakeLeftOffset < -storm.flakeWidth) {
        s.x = screenX-storm.flakeWidth-1;
      }
      s.refresh();
      yDiff = screenY+scrollY-s.y+storm.flakeHeight;
      if (yDiff<storm.flakeHeight) {
        s.active = 0;
        if (storm.snowStick) s.stick(); else s.recycle();
      } else {
        if (storm.useMeltEffect && s.active && s.type < 3 && !s.melting && Math.random()>0.998) {
          s.melting = true;
          s.melt();
        }
        if (storm.useTwinkleEffect) {
          if (s.twinkleFrame < 0) {
            if (Math.random() > 0.97) s.twinkleFrame = parseInt(Math.random() * 8, 10);
          } else {
            s.twinkleFrame--;
            if (!opacitySupported) {
              // fallback no-op
            } else {
              if (s.twinkleFrame === 0) s.setOpacity(s.o, 1);
              else if (s.twinkleFrame % 2 === 0) s.setOpacity(s.o, 0.5);
            }
          }
        }
      }
    };

    this.animate = function() { s.move(); };

    this.setVelocities = function() {
      s.vX = vRndX+rnd(storm.vMaxX*0.12,0.1);
      s.vY = vRndY+rnd(storm.vMaxY*0.12,0.1);
    };

    this.setOpacity = function(o,opacity) {
      if (!opacitySupported) return false;
      o.style.opacity = opacity;
    };

    this.melt = function() {
      if (!storm.useMeltEffect || !s.melting) s.recycle();
      else {
        if (s.meltFrame < s.meltFrameCount) {
          s.setOpacity(s.o,s.meltFrames[s.meltFrame]);
          var newFont = s.fontSize - (s.fontSize * (s.meltFrame / s.meltFrameCount));
          s.o.style.setProperty('font-size', Math.max(1, Math.round(newFont)) + 'px', 'important');
          s.o.style.setProperty('line-height', Math.max(1, Math.round(s.visualSize + 2 + (s.visualSize * 0.75 * (s.meltFrame / s.meltFrameCount)))) + 'px', 'important');
          s.meltFrame++;
        } else {
          s.recycle();
        }
      }
    };

    this.recycle = function() {
      s.o.style.display = 'none';
      s.o.style.position = (fixedForEverything?'fixed':'absolute');
      s.o.style.bottom = 'auto';
      s.setVelocities();
      s.vCheck();
      s.meltFrame = 0;
      s.melting = false;
      s.setOpacity(s.o,1);
      s.o.style.padding = '0px';
      s.o.style.margin = '0px';
      // Ripristina le dimensioni visive calcolate per questo fiocco
      s.o.style.setProperty('font-size', s.fontSize + 'px', 'important');
      s.o.style.setProperty('line-height', (s.visualSize + 2) + 'px', 'important');
      s.o.style.textAlign = 'center';
      s.o.style.verticalAlign = 'baseline';
      s.o.style.setProperty('width', s.visualSize + 'px', 'important');
      s.o.style.setProperty('height', s.visualSize + 'px', 'important');
      s.x = parseInt(rnd(screenX-storm.flakeWidth-20),10);
      s.y = parseInt(rnd(screenY)*-1,10)-storm.flakeHeight;
      s.refresh();
      s.o.style.display = 'block';
      s.active = 1;
    };

    this.recycle();
    this.refresh();
  };

  this.snow = function() {
    var active = 0, flake = null, i, j;
    for (i=0, j=storm.flakes.length; i<j; i++) {
      if (storm.flakes[i].active === 1) {
        storm.flakes[i].move();
        active++;
      }
      if (storm.flakes[i].melting) storm.flakes[i].melt();
    }
    if (active<storm.flakesMaxActive) {
      flake = storm.flakes[parseInt(rnd(storm.flakes.length),10)];
      if (flake.active === 0) flake.melting = true;
    }
    if (storm.timer) features.getAnimationFrame(storm.snow);
  };

  this.mouseMove = function(e) {
    if (!storm.followMouse) return true;
    var x = parseInt(e.clientX,10);
    if (x<screenX2) windOffset = -windMultiplier+(x/screenX2*windMultiplier);
    else { x -= screenX2; windOffset = (x/screenX2)*windMultiplier; }
  };

  this.createSnow = function(limit,allowInactive) {
    var i;
    for (i=0; i<limit; i++) {
      storm.flakes[storm.flakes.length] = new storm.SnowFlake(parseInt(rnd(flakeTypes),10));
      if (allowInactive || i>storm.flakesMaxActive) storm.flakes[storm.flakes.length-1].active = -1;
    }
    storm.targetElement.appendChild(docFrag);
  };

  this.timerInit = function() {
    storm.timer = true;
    storm.snow();
  };

  this.init = function() {
    var i;
    for (i=0; i<storm.meltFrameCount; i++) storm.meltFrames.push(1-(i/storm.meltFrameCount));
    storm.randomizeWind();
    storm.createSnow(storm.flakesMax);
    storm.events.add(window,'resize',storm.resizeHandler);
    storm.events.add(window,'scroll',storm.scrollHandler);
    if (storm.freezeOnBlur) {
      if (isIE) {
        storm.events.add(document,'focusout',storm.freeze);
        storm.events.add(document,'focusin',storm.resume);
      } else {
        storm.events.add(window,'blur',storm.freeze);
        storm.events.add(window,'focus',storm.resume);
      }
    }
    storm.resizeHandler();
    storm.scrollHandler();
    if (storm.followMouse) storm.events.add(isIE?document:window,'mousemove',storm.mouseMove);
    storm.animationInterval = Math.max(20,storm.animationInterval);
    storm.timerInit();
  };

  this.start = function(bFromOnLoad) {
    if (!didInit) didInit = true;
    else if (bFromOnLoad) return true;

    // Rileggi eventuale nuova config globale prima dell'avvio
    applyConfigObject(window && window.artsnowstormConfig ? window.artsnowstormConfig : null);

    if (typeof storm.targetElement === 'string') {
      var targetID = storm.targetElement;
      storm.targetElement = document.getElementById(targetID);
      if (!storm.targetElement) throw new Error('Snowstorm: Unable to get targetElement "'+targetID+'"');
    }
    if (!storm.targetElement) storm.targetElement = (document.body || document.documentElement);
    if (storm.targetElement !== document.documentElement && storm.targetElement !== document.body) {
      storm.resizeHandler = storm.resizeHandlerAlt;
      storm.usePixelPosition = true;
    }
    storm.resizeHandler();
    storm.usePositionFixed = (storm.usePositionFixed && !noFixed && !storm.flakeBottom);
    if (window.getComputedStyle) {
      try {
        targetElementIsRelative = (window.getComputedStyle(storm.targetElement, null).getPropertyValue('position') === 'relative');
      } catch(e) {
        targetElementIsRelative = false;
      }
    }
    fixedForEverything = storm.usePositionFixed;
    if (screenX && screenY && !storm.disabled) {
      storm.init();
      storm.active = true;
    }
  };

  function doDelayedStart() {
    window.setTimeout(function() { storm.start(true); }, 20);
    storm.events.remove(isIE?document:window,'mousemove',doDelayedStart);
  }

  function doStart() {
    if (!storm.excludeMobile || !isMobile) doDelayedStart();
    storm.events.remove(window, 'load', doStart);
  }

  if (storm.autoStart) storm.events.add(window, 'load', doStart, false);

  return this;

}(window, document));
