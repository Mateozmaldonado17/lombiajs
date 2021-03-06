var Lombia = (function() {
    
    var _d = document;
    var superData = null;
    function Lombia(app) {
        superData = app.data;
        var result = this.getElement(app.name);
        if (result === false) {
            console.log(new Error('element no exist'));
        }
        else {
            this.getElements(result);
        }
        return superData;
    };
    
    Lombia.prototype.removeAllNodes = function(myNode) {
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
    }

    Lombia.prototype.eval = function(exp, elem) {
        if (elem) {
            var innerHTMLElement = elem.innerHTML;
            while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
            }
        }
        return eval(exp);
    };


    Lombia.prototype.filters = function(elem) {
        if (elem.attributes) {
            if ('lombia-if' in elem.attributes) {
                let expression = this.eval.call(superData, elem.getAttribute('lombia-if'));
                if (typeof expression === 'boolean' && expression === false) {
                    console.log(expression);
                    let parent = elem.parentNode;
                    parent.removeChild(elem);
                }
            }
            else if ('lombia-for' in elem.attributes) {
                
                let exWithFor = `
                    for (${elem.getAttribute('lombia-for')}) {
                        elem.innerHTML += innerHTMLElement;
                    }
                `;
                this.eval.apply(superData, [exWithFor, elem]);
            }
        }
    }

    Lombia.prototype.preIterpolation = function(elem) {
        if (elem) {
            if (elem.nodeName === "#text") {
                this.interpolation(elem, superData);
            }
            else {
                this.getElements(elem);
            }
        }
    }

    Lombia.prototype.getElements = function(elements) {
        if (!elements) return console.error("This element doesn't- exist");
        elements.childNodes.forEach (e => {
            this.filters(e);
            this.preIterpolation(e);
        });
    }

    Lombia.prototype.setError = function(message) {
        return document.getElementsByTagName('body')[0].outerHTML = message;
    }
    
    Lombia.prototype.getElement = function(name) {
        var el = _d.querySelector("#" + name);
        return el ? el : false;
    }

    Lombia.prototype.setFilter = function(word, filter) {
        if (filter === 'capitalize') {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
        else if (filter === 'uppercase') {
            return word.toUpperCase();
        }
        else if (filter === 'lowercase') {
            return word.toLowerCase();
        }
        return false;
    }

    Lombia.prototype.GetOnlyInsideTags = function(outhtml = null) {
        if (outhtml) {
            var reg = new RegExp(/>\s*(.*)+\s*</);
            var res = outhtml.match(reg);
        }
        return false;
    }

    Lombia.prototype.setErrorForObject = function(e) {
        console.error('try other method for renderize an object ' + e);
        return '[is an object]';
    }

    Lombia.prototype.interpolation = function(result, sData) {
        var data = sData;
        var outhtml = result.textContent;
        var reg = new RegExp(/{{\s*(.*)+\s*}}/g);
        var res = outhtml.match(reg);
        if (res && data) {
            res.forEach(function(e) {
                var word = e.replace(/[{}]/g, '');
                var wordFilter = word.split("|");
                if (typeof data[wordFilter[0]] === "function") return console.error("Cannot renderize a Function " + e);
                if (data[wordFilter[0]]) {
                    var convertWord = wordFilter.length === 2 ? this.setFilter(data[wordFilter[0]], wordFilter[1]) : data[wordFilter[0]];
                    outhtml = outhtml.replace(e, (typeof data[wordFilter[0]] !== 'object' ? convertWord : this.setErrorForObject(e)));
                }
                else {
                    this.setError('# element no exist');
                    return console.error(new Error('error element ' + word + ' not exist in data'));
                }
            }.bind(this));
            result.textContent = outhtml;
        }
    };
    
    return Lombia;
})();