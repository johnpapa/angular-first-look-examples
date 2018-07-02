import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterTextComponent } from './filter-text.component';
import { FilterTextService } from './filter-text.service';

@NgModule({
  imports: [CommonModule, FormsModule],
  exports: [FilterTextComponent],
  declarations: [FilterTextComponent],
  providers: [FilterTextService]
})
export class FilterTextModule {}
