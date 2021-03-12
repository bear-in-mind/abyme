import{Controller as e}from"stimulus";class t extends e{connect(){console.log("Abyme Connected"),this.count&&this.add_default_associations()}get count(){return this.element.dataset.minCount||0}get position(){return"end"===this.associationsTarget.dataset.abymePosition?"beforeend":"afterbegin"}add_association(e){if(e&&e.preventDefault(),this.element.dataset.limit&&this.limit_check())return this.create_event("limit-reached"),!1;const t=this.build_html();this.create_event("before-add"),this.associationsTarget.insertAdjacentHTML(this.position,t),this.create_event("after-add")}remove_association(e){e.preventDefault(),this.create_event("before-remove"),this.mark_for_destroy(e),this.create_event("after-remove")}create_event(e,t=null){const a=new CustomEvent(`abyme:${e}`,{detail:{controller:this,content:t}});this.element.dispatchEvent(a),this.dispatch(a,e)}dispatch(e,t){"before-add"===t&&this.abymeBeforeAdd&&this.abymeBeforeAdd(e),"after-add"===t&&this.abymeAfterAdd&&this.abymeAfterAdd(e),"before-remove"===t&&this.abymeBeforeRemove&&this.abymeBeforeAdd(e),"after-remove"===t&&this.abymeAfterRemove&&this.abymeAfterRemove(e)}abymeBeforeAdd(e){}abymeAfterAdd(e){}abymeBeforeRemove(e){}abymeAfterRemove(e){}build_html(){let e=this.templateTarget.innerHTML.replace(/NEW_RECORD/g,(new Date).getTime());if(e.match(/<template[\s\S]+<\/template>/)){const t=e.match(/<template[\s\S]+<\/template>/)[0].replace(/(\[\d{12,}\])(\[[^\[\]]+\]"){1}/g,"[NEW_RECORD]$2");e=e.replace(/<template[\s\S]+<\/template>/g,t)}return e}mark_for_destroy(e){let t=e.target.closest(".abyme--fields");t.querySelector("input[name*='_destroy']").value=1,t.style.display="none",t.classList.add("abyme--marked-for-destroy")}limit_check(){return this.newFieldsTargets.filter(e=>!e.classList.contains("abyme--marked-for-destroy")).length>=parseInt(this.element.dataset.limit)}async add_default_associations(){let e=0;for(;e<this.count;)this.add_association(),e++,await this.sleep(1)}sleep(e){return new Promise(t=>setTimeout(t,e))}}t.targets=["template","associations","fields","newFields"];export{t as AbymeController};
//# sourceMappingURL=abyme.modern.js.map
