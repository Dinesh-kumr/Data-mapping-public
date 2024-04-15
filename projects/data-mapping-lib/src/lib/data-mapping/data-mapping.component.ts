import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input } from '@angular/core';

@Component({
  selector: 'data-mapping',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-mapping.component.html',
  styleUrl: './data-mapping.component.css'
})
export class DataMappingComponent {
  @Input({ required: true }) inputDataList: any = [];
  @Input({ required: true }) outputDataList: any = [];
  @Input({ required: true }) mappingList: any = [];

  dataList: any = [];
  elementPositions: any = {};
  pathDataList: any = [];
  pathDetail: any = {};
  draggedElement: any = {};
  selectedPosition: any = {};
  deletedDetail: any = {};
  outerContainer: any = {};
  domElements: any = {};

  constructor(private eleRef: ElementRef) { }

  ngOnInit() {
    this.createDataList();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.onResize();
    }, 0);
    const domElements = {
      rectangle: this.eleRef.nativeElement.querySelector('#rectangle'),
      arrow: this.eleRef.nativeElement.querySelector('#arrow'),
      outerContainer: this.eleRef.nativeElement.querySelector('#outerContent')
    };
    const resizeObserver = new ResizeObserver(_ => {
      this.onResize();
      const clickEvent = new MouseEvent('click');
      domElements.outerContainer.dispatchEvent(clickEvent);
    });
    resizeObserver.observe(domElements.outerContainer);
    this.domElements = domElements;
  }

  getLinePosition(start: any, end: any) {
    const positionX = start.x + (end.x - start.x) / 3;
    const positionY = start.x + (end.x - start.x) / 3 * 2;
    return `M${start.x} ${start.y} C${positionX} ${start.y}, ${positionY} ${end.y} ${end.x} ${end.y}`;
  }

  createDataList() {
    const dataList = this.inputDataList.concat(this.outputDataList);
    this.dataList = dataList.map((obj: any, index: number) => {
      return {
        title: obj.title,
        type: (this.inputDataList.length <= index) ? 'OUTPUT' : 'INPUT',
        position: (obj?.position?.x && obj?.position?.y) ? obj.position : { x: 0, y: 0 },
        isExpand: obj.isExpand ? obj.isExpand : false,
        id: obj.title.replace(/[^a-zA-Z0-9]/g, ''),
        key: obj.title,
        attributes: obj.attributes.map((attr: any) => ({
          label: attr,
          key: `${obj.title}#${attr}`,
          id: `${obj.title.replace(/[^a-zA-Z0-9]/g, '')}-${attr.replace(/[^a-zA-Z0-9]/g, '')}`
        })),
      };
    });
  }

  getPositionOfElement() {
    this.dataList.forEach((obj: any) => {
      const element: any = this.eleRef.nativeElement.querySelector(`#${obj.id}`);
      const rectangle: any = element.getBoundingClientRect();
      this.elementPositions[obj.key] = {
        x: (rectangle.left + rectangle.width / 2) - (this.outerContainer.left),
        y: (rectangle.top + rectangle.height / 2) - (this.outerContainer.top)
      }
      obj.attributes.forEach((attr: any) => {
        const ele: any = this.eleRef.nativeElement.querySelector(`#${attr.id}`);
        const rect: any = ele.getBoundingClientRect();
        this.elementPositions[obj.key][attr.key] = {
          x: (rect.left + rect.width / 2) - (this.outerContainer.left),
          y: (rect.top + rect.height / 2) - (this.outerContainer.top)
        };
      });
    });
    this.dataMapping();
  }

  dataMapping() {
    const collapsedDetails = this.dataList.map((obj: any) => { if (!obj.isExpand) return obj.title });
    this.pathDataList = this.mappingList.flatMap((obj: any) => {
      return Object.entries(obj.attributes).map(([key, value]: any) => {
        const splitValue = value.split('.');
        if (this.elementPositions[splitValue[0]] && this.elementPositions[obj.titleKey]) {
          const startPosition = this.elementPositions[splitValue[0]][`${splitValue[0]}#${splitValue[1]}`];
          const endPosition = this.elementPositions[obj.titleKey][`${obj.titleKey}#${key}`];
          if (startPosition && endPosition) {
            if (collapsedDetails.length) {
              if (collapsedDetails.includes(splitValue[0])) {
                startPosition.x = this.elementPositions[splitValue[0]].x;
                startPosition.y = this.elementPositions[splitValue[0]].y;
              }
              if (collapsedDetails.includes(obj.titleKey)) {
                endPosition.x = this.elementPositions[obj.titleKey].x;
                endPosition.y = this.elementPositions[obj.titleKey].y;
              }
            }
            const rectPosition = this.domElements.rectangle.getBoundingClientRect();
            const arrowPosition: any = this.domElements.arrow.getBoundingClientRect();
            const rectangle: any = { x: startPosition.x - rectPosition.width / 2, y: startPosition.y - rectPosition.height / 2 };
            const arrowPath: any = { x: endPosition.x - arrowPosition.width / 2, y: endPosition.y - arrowPosition.height / 2 };
            return {
              path: this.getLinePosition(startPosition, endPosition),
              key: `${obj.titleKey}#${key}#${splitValue[0]}#${splitValue[1]}`,
              rectangle: rectangle,
              arrowPath: arrowPath
            };
          }
        }
        return null;
      });
    });
  }

  onResize() {
    this.outerContainer = this.domElements.outerContainer.getBoundingClientRect();
    this.getPositionOfElement();
  }

  onDragStart(event: PointerEvent | any, index: number) {
    const movableRect = event.target.getBoundingClientRect();
    const outerRect = this.domElements.outerContainer.getBoundingClientRect();
    this.draggedElement = {
      isDragging: true,
      dragIndex: index,
      startPosition: {
        x: event.clientX - this.dataList[index].position.x,
        y: event.clientY - this.dataList[index].position.y
      },
      boundaries: {
        minX: (outerRect.left - movableRect.left) + this.dataList[index].position.x,
        maxX: (outerRect.right - movableRect.right) + this.dataList[index].position.x,
        minY: (outerRect.top - movableRect.top) + this.dataList[index].position.y,
        maxY: (outerRect.bottom - movableRect.bottom) + this.dataList[index].position.y
      },
      outerRect: outerRect,
      movableRect: movableRect
    }
  }

  onDragMove(event: any) {
    const index = this.draggedElement.dragIndex;
    this.dataList[index].position.x = event.clientX - this.draggedElement.startPosition.x;
    this.dataList[index].position.y = event.clientY - this.draggedElement.startPosition.y;
    this.dataList[index].position.x = Math.max(this.draggedElement.boundaries.minX, this.dataList[index].position.x);
    this.dataList[index].position.x = Math.min(this.draggedElement.boundaries.maxX, this.dataList[index].position.x);
    this.dataList[index].position.y = Math.max(this.draggedElement.boundaries.minY, this.dataList[index].position.y);
    this.dataList[index].position.y = Math.min(this.draggedElement.boundaries.maxY, this.dataList[index].position.y);
    this.getPositionOfElement();
  }

  creatingLine(event: PointerEvent) {
    this.outerContainer = this.domElements.outerContainer.getBoundingClientRect();
    if (this.draggedElement.isDragging && this.draggedElement.dragIndex !== null) this.onDragMove(event);
    if (this.selectedPosition.startPosition && !this.selectedPosition.endPosition) {
      const startList = this.selectedPosition.startPosition.split('#');
      const end = { x: (event.clientX - this.outerContainer.left), y: (event.clientY - this.outerContainer.top) };
      const start = this.elementPositions[startList[0]][`${startList[0]}#${startList[1]}`];
      this.draggedElement.isDragging = false;
      const rectPositoin = this.domElements.rectangle.getBoundingClientRect();
      const arrowPositoin: any = this.domElements.arrow.getBoundingClientRect();
      this.pathDetail.rectangle = { x: start.x - rectPositoin.width / 2, y: start.y - rectPositoin.height / 2 };
      this.pathDetail.arrowPath = { x: end.x - arrowPositoin.width / 2, y: end.y - arrowPositoin.height / 2 };
      this.pathDetail.pathData = this.getLinePosition(start, end);
    }
    if (!this.selectedPosition.startPosition && this.selectedPosition.endPosition) {
      this.selectedPosition.endPosition = '';
    }
    if (this.selectedPosition.startPosition && this.selectedPosition.endPosition) {
      const startPosition = this.selectedPosition.startPosition.split('#');
      const endPosition = this.selectedPosition.endPosition.split('#');
      const foundIndex = this.mappingList.findIndex((obj: any) => obj.titleKey == endPosition[0]);
      if (foundIndex !== -1) this.mappingList[foundIndex].attributes[endPosition[1]] = `${startPosition[0]}.${startPosition[1]}`;
      else {
        this.mappingList.push({
          titleKey: endPosition[0],
          attributes: {
            [endPosition[1]]: `${startPosition[0]}.${startPosition[1]}`
          }
        });
      }
      this.selectedPosition = {};
      this.pathDetail = {};
      this.dataMapping();
    }
    if (this.selectedPosition.remapPosition) this.remapLine();
  }

  remapLine() {
    const remapPosition = this.selectedPosition.remapPosition.split('#');
    this.draggedElement = {};
    this.mappingList.forEach((obj: any) => {
      if (obj.titleKey == remapPosition[0]) {
        if (obj.attributes.hasOwnProperty(remapPosition[1])) {
          const removedValueList = obj.attributes[remapPosition[1]].split('.');
          delete obj.attributes[remapPosition[1]];
          this.dataMapping();
          this.selectedPosition.startPosition = removedValueList.join('#');
        }
      }
    });
    this.selectedPosition.remapPosition = '';
  }

  removingLine() {
    if (this.draggedElement.isDragging) {
      this.draggedElement = {};
      this.getPositionOfElement();
    }
    if (this.selectedPosition.startPosition && this.pathDetail.pathData && !this.selectedPosition.endPosition) {
      this.selectedPosition = {};
      this.pathDetail = {};
    }
    this.dataMapping();
  }

  boxVisibility(event: any, obj: any) {
    obj.isExpand = !obj.isExpand;
    event.stopPropagation();
    setTimeout(() => {
      this.getPositionOfElement();
    }, 0);
  }

  @HostListener('document:keyup', ['$event'])
  hanleDeleteKeyboaedEvent(event: KeyboardEvent) {
    if (this.deletedDetail.label && event.key === 'Delete') {
      const deletedDetail = this.deletedDetail.label.split('#');
      this.mappingList.forEach((obj: any) => {
        if (obj.titleKey == deletedDetail[0] && obj.attributes[deletedDetail[1]] == (deletedDetail[2] + "." + deletedDetail[3])) {
          delete obj.attributes[deletedDetail[1]];
          this.deletedDetail = {};
          this.dataMapping();
        }
      });
    }
  }

  getDeletedDetail(pathData: string, index: number) {
    this.deletedDetail.label = pathData;
    this.deletedDetail.index = index;
  }
}
