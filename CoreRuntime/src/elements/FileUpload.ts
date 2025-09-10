import { FileUploadElement } from '../service/Element.js';

export default class FileUpload implements FileUploadElement {
  public type: string;
  public name: string;
  public displayText: string;

  public constructor(name: string, displayText: string) {
    this.type = 'FileUpload';
    this.name = name;
    this.displayText = displayText;
  }
}
