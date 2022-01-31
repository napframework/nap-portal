// Local Includes
import { NAPPortalItem } from './napportalitem';
import { getStringArrayArgumentValue } from './utils';
import {
  PortalDefs,
  APIMessage,
} from './types';

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

      const timeLabel: HTMLLabelElement = document.createElement('label');
      timeLabel.setAttribute('for', `${this.id}-${day}-time`);
      timeLabel.innerHTML = 'Time';

      const durationLabel: HTMLLabelElement = document.createElement('label');
      durationLabel.setAttribute('for', `${this.id}-${day}-duration`);
      durationLabel.innerHTML = 'Duration';

      const timeInput: HTMLInputElement = document.createElement('input');
      timeInput.setAttribute('id', `${this.id}-${day}-time`);
      timeInput.setAttribute('type', 'time');
      timeInput.addEventListener('input', () => this.onTimeInput());
      this.timeInputs.push(timeInput);

      const durationInput: HTMLInputElement = document.createElement('input');
      durationInput.setAttribute('id', `${this.id}-${day}-duration`);
      durationInput.setAttribute('type', 'time');
      durationInput.addEventListener('input', () => this.onTimeInput());
      this.timeInputs.push(durationInput);

      td1.innerHTML = day;
      td2.appendChild(timeLabel);
      td3.appendChild(timeInput);
      td4.appendChild(durationLabel);
      td5.appendChild(durationInput);
      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
      tr.appendChild(td5);
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
   * Called for the text input element input event
   */
  private onTimeInput(): void {
    const values: Array<string> = this.timeInputs.map(input => input.value);
    this.sendUpdate(values);
  }


  /**
   * Sets the value of the HTML text input element
   * @param value the updated portal item value
   */
  private setTimeInputs(values: Array<string>): void {
    this.timeInputs.forEach((input, index) => input.value = values[index]);
  }
}
