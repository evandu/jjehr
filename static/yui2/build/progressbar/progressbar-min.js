/*
 Copyright (c) 2011, Yahoo! Inc. All rights reserved.
 Code licensed under the BSD License:
 http://developer.yahoo.com/yui/license.html
 version: 2.9.0
 */
(function () {
    var c = YAHOO.util.Dom, i = YAHOO.lang, B = "yui-pb", D = B + "-mask", A = B + "-bar", z = B + "-anim", q = B + "-tl", l = B + "-tr", k = B + "-bl", g = B + "-br", h = "width", w = "height", m = "minValue", y = "maxValue", j = "value", a = "anim", x = "direction", e = "ltr", t = "rtl", G = "ttb", s = "btt", f = "barEl", d = "maskEl", v = "ariaTextTemplate", n = "animAcceleration", p = "background-position", o = "px", C = "start", F = "progress", u = "complete";
    var r = function (b) {
        r.superclass.constructor.call(this, document.createElement("div"), b);
        this._init(b);
    };
    YAHOO.widget.ProgressBar = r;
    r.MARKUP = ['<div class="', A, '"></div><div class="', D, '"><div class="', q, '"></div><div class="', l, '"></div><div class="', k, '"></div><div class="', g, '"></div></div>'].join("");
    i.extend(r, YAHOO.util.Element, {_init:function (b) {
    }, initAttributes:function (I) {
        r.superclass.initAttributes.call(this, I);
        this.set("innerHTML", r.MARKUP);
        this.addClass(B);
        var H, b = ["id", h, w, "class", "style"];
        while ((H = b.pop())) {
            if (H in I) {
                this.set(H, I[H]);
            }
        }
        this.setAttributeConfig(f, {readOnly:true, value:this.getElementsByClassName(A)[0]});
        this.setAttributeConfig(d, {readOnly:true, value:this.getElementsByClassName(D)[0]});
        this.setAttributeConfig(x, {value:e, validator:function (J) {
            if (this._rendered) {
                return false;
            }
            switch (J) {
                case e:
                case t:
                case G:
                case s:
                    return true;
                default:
                    return false;
            }
        }});
        this.setAttributeConfig(y, {value:100, validator:i.isNumber, method:function (J) {
            this.get("element").setAttribute("aria-valuemax", J);
            if (this.get(j) > J) {
                this.set(j, J);
            }
        }});
        this.setAttributeConfig(m, {value:0, validator:i.isNumber, method:function (J) {
            this.get("element").setAttribute("aria-valuemin", J);
            if (this.get(j) < J) {
                this.set(j, J);
            }
        }});
        this.setAttributeConfig(h, {getter:function () {
            return this.getStyle(h);
        }, method:this._widthChange});
        this.setAttributeConfig(w, {getter:function () {
            return this.getStyle(w);
        }, method:this._heightChange});
        this.setAttributeConfig(v, {value:"{value}"});
        this.setAttributeConfig(j, {value:0, validator:function (J) {
            return i.isNumber(J) && J >= this.get(m) && J <= this.get(y);
        }, method:this._valueChange});
        this.setAttributeConfig(a, {validator:function (J) {
            return !!YAHOO.util.Anim;
        }, setter:this._animSetter});
        this.setAttributeConfig(n, {value:null, validator:function (J) {
            return i.isNumber(J) || i.isNull(J);
        }, method:function (J) {
            this._fixAnim(this.get(a), J);
        }});
    }, render:function (H, I) {
        if (this._rendered) {
            return;
        }
        this._rendered = true;
        var J = this.get(x);
        this.addClass(B);
        this.addClass(B + "-" + J);
        var b = this.get("element");
        b.tabIndex = 0;
        b.setAttribute("role", "progressbar");
        b.setAttribute("aria-valuemin", this.get(m));
        b.setAttribute("aria-valuemax", this.get(y));
        this.appendTo(H, I);
        this.redraw(false);
        this._previousValue = this.get(j);
        this._fixEdges();
        this.on("minValueChange", this.redraw);
        this.on("maxValueChange", this.redraw);
        return this;
    }, redraw:function (b) {
        this._recalculateConstants();
        this._valueChange(this.get(j), b);
    }, destroy:function () {
        this.set(a, false);
        this.unsubscribeAll();
        var b = this.get("element");
        if (b.parentNode) {
            b.parentNode.removeChild(b);
        }
    }, _previousValue:0, _barSpace:100, _barFactor:1, _rendered:false, _heightChange:function (b) {
        if (i.isNumber(b)) {
            b += o;
        }
        this.setStyle(w, b);
        this._fixEdges();
        this.redraw(false);
    }, _widthChange:function (b) {
        if (i.isNumber(b)) {
            b += o;
        }
        this.setStyle(h, b);
        this._fixEdges();
        this.redraw(false);
    }, _fixEdges:function () {
        if (!this._rendered || YAHOO.env.ua.ie || YAHOO.env.ua.gecko) {
            return;
        }
        var J = this.get(d), L = c.getElementsByClassName(q, undefined, J)[0], I = c.getElementsByClassName(l, undefined, J)[0], K = c.getElementsByClassName(k, undefined, J)[0], H = c.getElementsByClassName(g, undefined, J)[0], b = (parseInt(c.getStyle(J, w), 10) - parseInt(c.getStyle(L, w), 10)) + o;
        c.setStyle(K, w, b);
        c.setStyle(H, w, b);
        b = (parseInt(c.getStyle(J, h), 10) - parseInt(c.getStyle(L, h), 10)) + o;
        c.setStyle(I, h, b);
        c.setStyle(H, h, b);
    }, _recalculateConstants:function () {
        var b = this.get(f);
        switch (this.get(x)) {
            case e:
            case t:
                this._barSpace = parseInt(this.get(h), 10) - (parseInt(c.getStyle(b, "marginLeft"), 10) || 0) - (parseInt(c.getStyle(b, "marginRight"), 10) || 0);
                break;
            case G:
            case s:
                this._barSpace = parseInt(this.get(w), 10) - (parseInt(c.getStyle(b, "marginTop"), 10) || 0) - (parseInt(c.getStyle(b, "marginBottom"), 10) || 0);
                break;
        }
        this._barFactor = this._barSpace / (this.get(y) - (this.get(m) || 0)) || 1;
    }, _animSetter:function (I) {
        var H, b = this.get(f);
        if (I) {
            if (I instanceof YAHOO.util.Anim) {
                H = I;
            } else {
                H = new YAHOO.util.Anim(b);
            }
            H.onTween.subscribe(this._animOnTween, this, true);
            H.onComplete.subscribe(this._animComplete, this, true);
            this._fixAnim(H, this.get(n));
        } else {
            H = this.get(a);
            if (H) {
                H.onTween.unsubscribeAll();
                H.onComplete.unsubscribeAll();
            }
            H = null;
        }
        return H;
    }, _fixAnim:function (I, H) {
        if (I) {
            if (!this._oldSetAttribute) {
                this._oldSetAttribute = I.setAttribute;
            }
            var b = this;
            switch (this.get(x)) {
                case e:
                    I.setAttribute = function (J, L, K) {
                        L = Math.round(L);
                        b._oldSetAttribute.call(this, J, L, K);
                        if (J == h) {
                            b._oldSetAttribute.call(this, p, -L * H, o);
                        }
                    };
                    break;
                case t:
                    I.setAttribute = function (J, M, K) {
                        M = Math.round(M);
                        b._oldSetAttribute.call(this, J, M, K);
                        if (J == h) {
                            var L = b._barSpace - M;
                            b._oldSetAttribute.call(this, "left", L, o);
                            b._oldSetAttribute.call(this, p, -L + M * H, o);
                        }
                    };
                    break;
                case G:
                    I.setAttribute = function (J, L, K) {
                        L = Math.round(L);
                        b._oldSetAttribute.call(this, J, L, K);
                        if (J == w) {
                            b._oldSetAttribute.call(this, p, "center " + (-L * H), o);
                        }
                    };
                    break;
                case s:
                    I.setAttribute = function (J, M, K) {
                        M = Math.round(M);
                        b._oldSetAttribute.call(this, J, M, K);
                        if (J == w) {
                            var L = b._barSpace - M;
                            b._oldSetAttribute.call(this, "top", L, o);
                            b._oldSetAttribute.call(this, p, "center " + (M * H - L), o);
                        }
                    };
                    break;
            }
        }
    }, _animComplete:function () {
        var b = this.get(j);
        this._previousValue = b;
        this.fireEvent(F, b);
        this.fireEvent(u, b);
        c.removeClass(this.get(f), z);
    }, _animOnTween:function (b, H) {
        var I = Math.floor(this._tweenFactor * H[0].currentFrame + this._previousValue);
        this.fireEvent(F, I);
    }, _valueChange:function (J, H) {
        var I = this.get(a), b = Math.floor((J - this.get(m)) * this._barFactor);
        this._setAriaText(J);
        if (this._rendered) {
            if (I) {
                I.stop();
                if (I.isAnimated()) {
                    I._onComplete.fire();
                }
            }
            this.fireEvent(C, this._previousValue);
            r._barSizeFunctions[((H !== false) && I) ? 1 : 0][this.get(x)].call(this, J, b, this.get(f), I);
        }
    }, _setAriaText:function (H) {
        var b = this.get("element"), I = i.substitute(this.get(v), {value:H, minValue:this.get(m), maxValue:this.get(y)});
        b.setAttribute("aria-valuenow", H);
        b.setAttribute("aria-valuetext", I);
    }});
    var E = [
        {},
        {}
    ];
    r._barSizeFunctions = E;
    E[0][e] = function (J, b, H, I) {
        c.setStyle(H, h, b + o);
        this.fireEvent(F, J);
        this.fireEvent(u, J);
    };
    E[0][t] = function (J, b, H, I) {
        c.setStyle(H, h, b + o);
        c.setStyle(H, "left", (this._barSpace - b) + o);
        this.fireEvent(F, J);
        this.fireEvent(u, J);
    };
    E[0][G] = function (J, b, H, I) {
        c.setStyle(H, w, b + o);
        this.fireEvent(F, J);
        this.fireEvent(u, J);
    };
    E[0][s] = function (J, b, H, I) {
        c.setStyle(H, w, b + o);
        c.setStyle(H, "top", (this._barSpace - b) + o);
        this.fireEvent(F, J);
        this.fireEvent(u, J);
    };
    E[1][e] = function (J, b, H, I) {
        c.addClass(H, z);
        this._tweenFactor = (J - this._previousValue) / I.totalFrames / I.duration;
        I.attributes = {width:{to:b}};
        I.animate();
    };
    E[1][t] = E[1][e];
    E[1][G] = function (J, b, H, I) {
        c.addClass(H, z);
        this._tweenFactor = (J - this._previousValue) / I.totalFrames / I.duration;
        I.attributes = {height:{to:b}};
        I.animate();
    };
    E[1][s] = E[1][G];
})();
YAHOO.register("progressbar", YAHOO.widget.ProgressBar, {version:"2.9.0", build:"2800"});