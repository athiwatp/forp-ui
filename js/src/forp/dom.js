(function(f) {

    "use strict";

    /**
     * DOM Element wrapper, makes it fluent
     * @param DOM Element
     */
    f.DOMElementWrapper = function(element)
    {
        var self = this;
        this.element = element;
        this.parent = null;
        this.classes = [];
        this.events = {};

        this.bind = function(event, fn) {
            if(!this.events[event]) this.events[event] = [];

            this.events[event].push(fn);

            if (this.element.addEventListener) {
                this.element.addEventListener(
                    event,
                    self.trigger,
                    false);
            } else if (this.element.attachEvent) {
                var r = this.element.attachEvent(
                    "on" + event,
                    self.trigger
                );
                return r;
            }
            return this;
        };

        this.unbind = function(event, fn) {
            if(this.events[event]) {

                if (this.element.removeEventListener) {
                    this.element.removeEventListener(event, fn, false);
                } else if (this.element.detachEvent) {
                    this.element.detachEvent("on" + event, fn);
                }

                for(var i in this.events[event]) {
                    if(this.events[event][i] == fn) {
                        this.events[event].splice(i, 1);
                        return this;
                    };
                }
            }
            return this;
        };

        this.trigger = function(event) {
            var eventType = '';
            if(event instanceof Object) {
                eventType = event.type;
            } else {
                eventType = event;
            }
            if(self.events[eventType]) {
                for(var fn in self.events[eventType]) {
                    self.events[eventType][fn].call(self, event);
                }
            }
            return this;
        };

        this.find = function(s) {
            return new f.DOMElementWrapperCollection(this.element.querySelectorAll(s));
        };

        this.prepend = function(o) {
            this.element.insertBefore(o.element, this.element.firstChild);
            return this;
        };
        this.append = function(o) {
            this.element.appendChild(o.element);
            o.parent = this;
            return this;
        };
        this.appendTo = function(o) {
            o.append(this);
            this.parent = o;
            return this;
        };
        this.class = function(c) {
            this.classes = [];
            return this.addClass(c);
        };
        this.getClass = function(c) {
            return this.getAttr("class");
        };
        this.addClass = function(c) {
            var cArr = c.split(" ");
            for (var i=0; i<cArr.length; i++) {
                if(f.inArray(cArr[i], this.classes)) return this;
                this.classes.push(cArr[i]);
            }
            return this.attr("class", this.classes.join(" "));
        };
        this.removeClass = function(c) {
            for (var k in this.classes) {
                if (this.classes[k] == c) {
                    this.classes.splice(k, 1);
                }
            }
            return this.attr("class", this.classes.join(" "));
        };
        this.text = function(t) {
            this.element.innerHTML = t;
            return this;
        };
        this.getAttr = function(attr) {
            return this.element.getAttribute(attr);
        };
        this.attr = function(attr, val) {
            var attr = document.createAttribute(attr);
            attr.nodeValue = val;
            this.element.setAttributeNode(attr);
            return this;
        };
        this.remove = function() {
            this.element.parentNode.removeChild(this.element);
        };
        this.empty = function() {
            this.element.innerHTML = '';
            return this;
        };
        this.top = function() {
            return this.getPosition().y;
        };
        this.getPosition = function() {
            var x = 0, y = 0, e = this.element;
            while(e){
                x += e.offsetLeft;
                y += e.offsetTop;
                e = e.offsetParent;
            }
            return {x: x, y: y};
        };
        this.height = function() {
            return this.element.offsetHeight;
        };
        this.width = function() {
            return this.element.offsetWidth;
        };
        this.css = function(p, complete)
        {
            var transitionEnd = f.Normalizr.getEventTransitionEnd();
            var _c = function() {
                complete();
                document.removeEventListener(transitionEnd, _c);
            };
            document.addEventListener(transitionEnd, _c);
            this.attr("style", p);
            return this;
        };
        this.table = function(headers) {
            return (new f.Table(headers)).appendTo(this);
        };
        this.insertAfter = function(element) {
            this.element.parentNode.insertBefore( element.element, this.element.nextSibling );
            return this;
        };
        this.nextSibling = function() {
            return f.wrap(this.element.nextSibling);
        };
        this.addEventListener = function(listener) {
            listener.target = this;
            listener.init();
            return this;
        };
        this.scrollBottom = function() {
            this.element.scrollTop = f.wrap(this.element.firstChild).height();
            return this;
        };
        this.parent = function() {
            return f.wrap(this.element.parentNode);
        }
    };
    /**
     * DOM Element Collection Class
     * @param DOM Element
     */
    f.DOMElementWrapperCollection = function(elements)
    {
        this.elements = elements;
        this.each = function(fn)
        {
            for(var i=0; i<this.elements.length; i++) {
                fn(new f.DOMElementWrapper(this.elements[i]));
            }
            return this;
        };
        this.getElement = function(i)
        {
            return new f.DOMElementWrapper(this.elements[i]);
        };
    };
})(forp);