// Local Includes
import { NAPPortalItem } from './napportalitem';
import { getStringArrayArgumentValue } from './utils';
import {
  PortalDefs,
  APIMessage,
} from './types';
import { clamp } from 'lodash';

const days: Array<string> = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/**
 * NAPPortalItemOperationalCalendar
 */
export class NAPPortalItemOperationalCalendar extends NAPPortalItem {

  private readonly timeInputs: Array<HTMLInputElement> = [];  ///< The HTML time input elements to control the operational calendar values


  /**
   * Constructor
   */
  constructor(message: APIMessage) {
    super(message);

    // Extract properties from API message
    const values: Array<string> = getStringArrayArgumentValue(message, PortalDefs.itemValueArgName);

    // Create HTML elements
    const table: HTMLTableElement = document.createElement('table');
    const tbody: HTMLTableSectionElement = document.createElement('tbody');
    for (const day of days) {
      const tr: HTMLTableRowElement = document.createElement('tr');
      const td1: HTMLTableCellElement = document.createElement('td');
      const td2: HTMLTableCellElement = document.createElement('td');
      const td3: HTMLTableCellElement = document.createElement('td');
      const td4: HTMLTableCellElement = document.createElement('td');
      const td5: HTMLTableCellElement = document.createElement('td');
      const td6: HTMLTableCellElement = document.createElement('td');
      const td7: HTMLTableCellElement = document.createElement('td');

      const timeLabel: HTMLLabelElement = document.createElement('label');
      timeLabel.setAttribute('for', `${this.id}-${day}-time`);
      timeLabel.innerHTML = 'Time';

      const hoursLabel: HTMLLabelElement = document.createElement('label');
      hoursLabel.setAttribute('for', `${this.id}-${day}-duration-hours`);
      hoursLabel.innerHTML = 'Hours';

      const minutesLabel: HTMLLabelElement = document.createElement('label');
      minutesLabel.setAttribute('for', `${this.id}-${day}-duration-minutes`);
      minutesLabel.innerHTML = 'Minutes';

      const timeInput: HTMLInputElement = document.createElement('input');
      timeInput.setAttribute('id', `${this.id}-${day}-time`);
      timeInput.setAttribute('type', 'time');
      timeInput.addEventListener('input', () => this.onTimeInput());
      this.timeInputs.push(timeInput);

      const hoursInput: HTMLInputElement = document.createElement('input');
      hoursInput.setAttribute('id', `${this.id}-${day}-duration-hours`);
      hoursInput.setAttribute('type', 'number');
      hoursInput.setAttribute('min', '0');
      hoursInput.setAttribute('max', '24');
      hoursInput.addEventListener('input', () => this.onTimeInput());
      this.timeInputs.push(hoursInput);

      const minutesInput: HTMLInputElement = document.createElement('input');
      minutesInput.setAttribute('id', `${this.id}-${day}-duration-minutes`);
      minutesInput.setAttribute('type', 'number');
      minutesInput.setAttribute('min', '0');
      minutesInput.setAttribute('max', '60');
      minutesInput.addEventListener('input', () => this.onTimeInput());
      this.timeInputs.push(minutesInput);

      td1.innerHTML = day;
      td2.appendChild(timeLabel);
      td3.appendChild(timeInput);
      td4.appendChild(hoursLabel);
      td5.appendChild(hoursInput);
      td6.appendChild(minutesLabel);
      td7.appendChild(minutesInput);
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
      tr.appendChild(td5);
      tr.appendChild(td6);
      tr.appendChild(td7);
      tbody.appendChild(tr);
    }

    // Set initial time values
    this.setTimeInputs(values);

    // Append HTML elements
    table.appendChild(tbody);
    this.contentTD.appendChild(table);
  }


  /**
   * Update the portal item with an API message received from the server
   * @param message the API message containing the portal item update
   */
  public update(message: APIMessage): void {
    const values: Array<string> = getStringArrayArgumentValue(message, PortalDefs.itemValueArgName);
    this.setTimeInputs(values);
  }


  /**
   * Called when one of the time inputs has changed
   */
  private onTimeInput(): void {
    // Construct the array with appropriate formatting
    const values: Array<string> = [];
    for (let i = 0; i < this.timeInputs.length; i+=3){
      // First value, start can be pushed as is
      values.push(this.timeInputs[i].value);
      
      // The second and third input represent hours and minutes, they need to be clamped and formatted 
      // into the correct format 'HH:mm' and added to the array
      let hours: number = clamp(Number(this.timeInputs[i+1].value), 0, 23);
      let hours_string = hours.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
      let minutes: number = clamp(Number(this.timeInputs[i+2].value), 0, 60);
      let minutes_string = minutes.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});

      // push value into array
      values.push(hours_string + ":" + minutes_string);

      // set correct hours and minutes
      this.timeInputs[i+1].value = hours.toString();
      this.timeInputs[i+2].value = minutes.toString();
    }
    this.sendUpdate(values);
  }


  /**
   * Sets the value of the HTML operational calendar
   * @param value the updated portal item value
   */
  private setTimeInputs(values: Array<string>): void {
    let idx : number = 0;
    for (let i = 0; i < values.length; i+=2) {
      this.timeInputs[idx].value = values[i]; idx += 1;

      var array = values[i+1].split(":");
      this.timeInputs[idx].value = Number(array[0]).toString(); idx += 1;
      this.timeInputs[idx].value = Number(array[1]).toString(); idx += 1;
    }
  }
}
