export class AmiiboModel {
  /**
   * The series the amiibo belongs to.
   */
  private _amiiboSeries: string;
  /**
   * The character of the amiibo, multiple character have
   * different amiibo design.
   */
  private _character: string;
  /**
   * The game series of the amiibo.
   */
  private _gameSeries: string;
  /**
   * The 1st 8 value of the hexadecimal to recognize the amiibo.
   * Note: 0 - 7 value in the hexadecimal
   */
  private _head: string;
  /**
   * The image link of the amiibo.
   */
  private _image: string;
  /**
   * The name of the amiibo.
   */
  private _name: string;
  /**
   * The release date for North America, Japan, Europe and Australia Date Format: yyyy - mm - dd Warning: If date is not available, it will return as null	Note: If date is not available, it will return as null
   */
  private _release: any;
  /**
   * The next 8 value of the hexadecimal to recognize the amiibo. Note: 8 - 15 value in the hexadecimal
   */
  private _tail: string;
  /**
   * The type it belongs to.Example: card, figure and yarn
   */
  private _type: string;

  constructor(
    amiiboSeries?: string,
    character?: string,
    gameSeries?: string,
    head?: string,
    image?: string,
    name?: string,
    release?: any,
    tail?: string,
    type?: string
  ) {
    this._amiiboSeries = amiiboSeries;
    this._character = character;
    this._gameSeries = gameSeries;
    this._head = head;
    this._image = image;
    this._name = name;
    this._release = release;
    this._tail = tail;
    this._type = type;
  }

  set amiiboSeries(value: string) {
    this._amiiboSeries = value;
  }
  get amiiboSeries(): string {
    return this._amiiboSeries;
  }
  set character(value: string) {
    this._character = value;
  }
  get character(): string {
    return this._character;
  }
  set gameSeries(value: string) {
    this._gameSeries = value;
  }
  get gameSeries(): string {
    return this._gameSeries;
  }
  set head(value: string) {
    this._head = value;
  }
  get head(): string {
    return this._head;
  }
  set image(value: string) {
    this._image = value;
  }
  get image(): string {
    return this._image;
  }
  set name(value: string) {
    this._name = value;
  }
  get name(): string {
    return this._name;
  }
  set release(value: any) {
    this._release = value;
  }
  get release(): any {
    return this._release;
  }
  set tail(value: string) {
    this._tail = value;
  }
  get tail(): string {
    return this._tail;
  }
  set type(value: string) {
    this._type = value;
  }
  get type(): string {
    return this._type;
  }
}
