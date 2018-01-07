import { Component, Input, ElementRef, ViewChild, Renderer, forwardRef, OnInit, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const TAGS_EDIT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TagsEditorComponent),
  multi: true
};

@Component({
  selector: 'tags-editor',
  template: '<div *ngIf="editing">'+
  '<label class="col-form-label">{{label}}</label>'+
  '<div class="input-group">'+
      '<div class=tags>'+
          '<ul class="tag-list">'+
              '<li class="tag-item" *ngFor="let t of tags; let i = index">'+
                  '<span>{{t}}</span>'+
                  '<a class="tag-remove-button" (click)="removeTagItem(i)">×</a>'+
              '</li>'+
          '</ul>'+
          '<input #tagsEditorControl id="ngtags-control" type="text" class="tag-input" autocomplete="off" (keydown.enter)="addTag($event)" [placeholder]="placeholder">'+
      '</div>'+
  '</div>'+
  '<div class="text-right">'+
      '<button class="btn btn-sm btn-success" type="button" (click)="onSaveComplete()">'+
         '<i class="fa fa-check" aria-hidden="true"></i>'+
      '</button>'+
      '<button class="btn btn-sm btn-danger" type="button" (click)="onCancelComplete()">'+
          '<i class="fa fa-times" aria-hidden="true"></i>'+
      '</button>'+
  '</div>'+
'</div>'+
'<div *ngIf="!editing">'+
  '<div class="form-group">'+
      '<label class="col-form-label">{{label}}</label>'+
      '<div *ngIf="IsTagsEmpty(value)" (click)="edit(value)" (focus)="edit(value);" tabindex="0" class="inline-edit-empty">'+
          '{{placeholder}}&nbsp;'+
      '</div>'+
      '<div *ngIf="!IsTagsEmpty(value)" (click)="edit(value)" (focus)="edit(value);" tabindex="0" [ngClass]="disabled == \'true\' ? \'inline-no-edit\' : \'inline-edit\'">'+
          '<ul class="tag-list">'+
              '<li class="tag-item" *ngFor="let t of value;">'+
                  '<span>{{t}}</span>'+
              '</li>'+
          '</ul>'+
      '</div>'+
  '</div>'+
'</div>',
  styles:[
    '.tags { -moz-appearance: none; -webkit-appearance: none;  border: 1px solid #ccc; border-radius: 4px; width: 100%; -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);   -moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075); box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);  -webkit-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;  -moz-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;  -moz-appearance: textfield; -webkit-appearance: textfield; padding: 1px; overflow: hidden; word-wrap: break-word; cursor: text; background-color: #fff; border: 1px solid darkgray; box-shadow: 1px 1px 1px 0 lightgrey inset; height: 100%; }',
    '.tag-list { margin: 0;padding: 0; list-style-type: none; }',
    '.tag-input { border: 0; outline: none; margin: 2px; padding: 0; padding-left: 5px; float: left; height: 26px; width: 100%; font: 14px; }',
    '.tag-item { margin: 2px; padding: 0 5px; display: inline-block; font: 14px; height: 26px; line-height: 25px; border: 1px solid #acacac; border-radius: 3px; background: -webkit-linear-gradient(top, #f0f9ff 0%, #cbebff 47%, #a1dbff 100%); background: linear-gradient(to bottom, #f0f9ff 0%, #cbebff 47%, #a1dbff 100%); color: #fff; background: #428bca; border: 1px solid #357ebd; }',
    '.tag-remove-button { margin: 0 0 0 5px; padding: 0; border: none; background: none; cursor: pointer; vertical-align: middle; font: bold 16px Arial, sans-serif; color: #585858; }',
    '.col-form-label { padding-bottom: 0px !important; }',
    '.inline-edit { text-decoration: none; border-bottom: #007bff dashed 1px; cursor: pointer; width: auto;}',
    '.inline-no-edit { text-decoration: none; border-bottom: #959596 dashed 1px; cursor: not-allowed; width: auto;}',
    '.inline-edit-empty{ text-decoration: none; border-bottom: red dashed 1px; cursor: pointer; width: auto; color: #b9b8b8;}'
  
  ],
  providers: [TAGS_EDIT_CONTROL_VALUE_ACCESSOR]
})
export class TagsEditorComponent implements ControlValueAccessor, OnInit {

  @ViewChild('tagsEditorControl') tagsEditorControl: ElementRef; // input DOM element
  @Input() label: string = '';  // Label value for input element
  @Input() placeholder: string = ''; // Placeholder value ofr input element
  @Input() required: boolean = false; // Is input requried?
  @Input() disabled: string = 'false'; // Is input disabled?
  @Input() id: string = ''
  @Input() stringlength: string = ''
  @Output() onSave: EventEmitter<string> = new EventEmitter();
  @Output() onCancel: EventEmitter<string> = new EventEmitter();

  tags:string[]=[];
  private _originalValue:any;
  private _value: string[] = []; // Private variable for input value
  private preValue: string[] = []; // The value before clicking to edit
  private editing: boolean = false; // Is Component in edit mode?
  public onChange: any = Function.prototype; // Trascend the onChange event
  public onTouched: any = Function.prototype; // Trascend the onTouch event
  isempty:boolean;
  constructor(element: ElementRef, private _renderer: Renderer) { }

  onSaveComplete() {
    this.onSave.emit('clicked save');
    this.editing=false;
  }

  onCancelComplete() {
    debugger;
    this.editing=false;
    this.value=this._originalValue;
    this.onCancel.emit('clicked cancel');
  }

  // Control Value Accessors for ngModel
  get value(): any {
    return this._value;
  }

  set value(v: any) {
    if (v !== this._value) {
      this._value = v;
      this.onChange(v);
    }
  }

  // Required for ControlValueAccessor interface
  writeValue(value: any) {
    this._value = value;
  }

  // Required forControlValueAccessor interface
  public registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  // Required forControlValueAccessor interface
  public registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }
 
  // Start the editting process for the input element
  edit(value: any) {
    if (this.disabled === "true") {
      return;
    }
    debugger;
    this.preValue = value;
    this.editing = true;
    this.tags = this.value;
    if(value != null || value != undefined) this._originalValue=value.slice(0);
  }

  IsTagsEmpty(value:string[]): Boolean{
    debugger;
    var r: boolean;

    r =  (this.value === null || this.value === undefined);
    if(r===false){
      if(value.length <= 0){
        r=true;
      }
    }

    return r;
  }

  removeTagItem(i:number){
    this.tags.splice(i,1);
    this._value=this.tags;
  }

  addTag(event:any){
    debugger;
    var input = <HTMLInputElement>event.target;
    var ta = input.value;
    if(this.tags === null || this.tags === undefined) this.tags = [];
    var foundI = this.tags.indexOf(ta);
    if(foundI == -1){
      input.value = '';
      input.focus();
      this.tags.push(ta);
      this.value=this.tags;
    }
    else{
      return;
    }
  }

  ngOnInit() {
  }
}