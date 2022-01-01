import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { convertToJsonDTO, parseJsonDTO } from '../../../../api/json.dto.helpers';
import { WorkbookModel } from '../../../../api/workbook/workbook.model';
import { DataStoreService } from '@soer/sr-dto';
import { MixedBusService } from '@soer/mixed-bus';
import { CommandCreate, CommandUpdate } from '@soer/sr-dto';
import { BusOwner } from '@soer/mixed-bus';
import { Subscription } from 'rxjs';

@Component({
  selector: 'soer-edit-abstracte-page',
  templateUrl: './edit-abstracte-page.component.html',
  styleUrls: ['./edit-abstracte-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAbstractePageComponent implements OnDestroy {
  form: FormGroup;
  public previewFlag = false;
  subscriptions: Subscription[] = [];
  constructor(
    @Inject('workbook') private workbookId: BusOwner,
    private formBuilder: FormBuilder,
    private bus$: MixedBusService,
    private store$: DataStoreService
  ) {
    this.form = this.formBuilder.group({
      id: [null],
      question: [null, [Validators.maxLength(255)]],
      text: [null, [Validators.maxLength(255)]]
    });
    this.subscriptions = [
      parseJsonDTO<WorkbookModel>(this.store$.of(this.workbookId), 'workbook' + Math.random()).subscribe(
        data => {
          this.form.patchValue(data?.pop() || {});
        }
      )
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
  onSubmit(): void {
    if (this.form.value.id === null) {
          this.bus$.publish(
              new CommandCreate(
                this.workbookId,
                convertToJsonDTO(this.form.value, ['id']),
              )
          );
    } else {
      this.bus$.publish(
        new CommandUpdate(
          this.workbookId,
          {...convertToJsonDTO(this.form.value, ['id']), id: this.form.value.id}
        )
    );
    }
  }
}