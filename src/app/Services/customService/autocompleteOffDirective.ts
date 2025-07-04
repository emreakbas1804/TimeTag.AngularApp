import { Directive, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Directive({
    selector: 'input, textarea, select',
})
export class AutocompleteOffDirective implements AfterViewInit {
    constructor(private el: ElementRef, private renderer: Renderer2) {}

    ngAfterViewInit() {
        // autocomplete="off" zorla
        this.renderer.setAttribute(this.el.nativeElement, 'autocomplete', 'off');
    }
}
