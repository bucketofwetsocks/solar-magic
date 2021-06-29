import { Injectable } from '@angular/core';

const decodeHtml = (<any>window).require('decode-html');

@Injectable({
  providedIn: 'root'
})
export class StringService {

  constructor() { }

  /**
   * data coming back from the SMWCentral "API" is full of html jank.
   * we have to clean it up before display.
   */
  public cleanString(str: string): string {
    let result = str;
    if (!result)
      return result;

    result = decodeHtml(result);
    result = result
      .replace(/\&#039;/g, `'`)
      .replace(/\[\&hellip;\]/g, `...`);

    return result;
  }
}
