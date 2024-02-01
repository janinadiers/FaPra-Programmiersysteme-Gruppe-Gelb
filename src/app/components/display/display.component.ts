import {Component, ElementRef, EventEmitter, OnDestroy, Output, OnInit, ViewChild} from '@angular/core';
import {DisplayService} from '../../services/display.service';
import {catchError, of, Subscription, take} from 'rxjs';
import {Diagram} from '../../classes/diagram/diagram';
import {ExampleFileComponent} from "../example-file/example-file.component";
import {FileReaderService} from "../../services/file-reader.service";
import {HttpClient} from "@angular/common/http";
import {ActivebuttonService} from 'src/app/services/activebutton.service';
import {DrawingService} from "../../services/drawing.service";
import {ReachabilityGraph} from 'src/app/classes/diagram/reachability-graph';
import {MarkenspielService} from "../../services/markenspiel.service";
import { SpringEmbedderService } from 'src/app/services/spring-embedder-for-reachability-graph.service';


@Component({
    selector: 'app-display',
    templateUrl: './display.component.html',
    styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit, OnDestroy {

    @ViewChild('drawingArea') drawingArea: ElementRef<SVGElement> | undefined;

    @Output('fileContent') fileContent: EventEmitter<{ fileContent: string, fileExtension: string }>;

    private subscriptionOfToolbar: Subscription = new Subscription;
    private _sub: Subscription;
    private _diagram: Diagram | undefined;

    constructor(
        private _displayService: DisplayService,
        private _fileReaderService: FileReaderService,
        private _http: HttpClient,
        private activeButtonService: ActivebuttonService,
        private _drawingService: DrawingService,
        private _springEmbedderService: SpringEmbedderService) {

        this.fileContent = new EventEmitter<{ fileContent: string, fileExtension: string }>();

        this._sub = this._displayService.diagram$.subscribe(diagram => {

            this._diagram = diagram;

            this.draw();

        });

        this.activeButtonService.zoomButtonClickObservable().subscribe(buttonId => {

            if (buttonId === "zoom-in") {
                Diagram.zoomFactor = Diagram.zoomFactor - 0.1;
            } else if (buttonId === "zoom-out") {
                Diagram.zoomFactor = Diagram.zoomFactor + 0.1;
            }
        });
    }

    ngOnInit() {
        this._diagram!.canvasElement = document.getElementById('canvas') as unknown as SVGElement;
        this.subscriptionOfToolbar = this.activeButtonService.getButtonClickObservable().subscribe((buttonId: string) => {
            if (buttonId === "clear" && this.activeButtonService.isReachButtonActive == false) {
                if(Diagram.algorithmIsActive) return
                let clearElements: boolean = true;
                this.clearDrawingArea(clearElements);
            } else if (buttonId === "deleteLast" && this.activeButtonService.isReachButtonActive == false) {
                if(Diagram.algorithmIsActive) return
                this.deleteLastElement();
            } else if (buttonId === "reachabilityGraph") {

                this.generateReachabilityGraph();
            }
        });

        this._diagram?.places.forEach((element) => {
            element.svgElement?.addEventListener(('click'), () => {
                if (!element.svgElement) {
                    return
                }
                this._drawingService.onCircleSelect(element);
            });
        });

        this._diagram?.lines.forEach((element) => {
            element.svgElement?.addEventListener(('click'), () => {

                if (!element.svgElement) {
                    return
                }
                this._drawingService.onLineSelect(element);
            });
        });

        this._diagram?.transitions.forEach((element) => {
            element.svgElement?.addEventListener(('click'), () => {
                if (!element.svgElement) {
                    return
                }
                this._drawingService.onRectSelect(element);
            });
        });

        this._diagram?.transitions.forEach((element) => {
            element.svgElement?.addEventListener(('dblclick'), () => {
                if (!element.svgElement) {
                    return
                }
                this._drawingService.startSimulation(element);
            });
        });
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
        this.fileContent.complete();
        this.subscriptionOfToolbar.unsubscribe();
    }

    get viewBox(): string {

        const canvas = document.getElementById('canvas');

        if (canvas) {

            const rect = canvas.getBoundingClientRect();

            // die viewBox des svg Elements wird an den Zoomfaktor angepasst (Je größer die viewBox, desto kleiner das Diagramm)
            // die viewBox ist eine Art zusätzlicher innerer Canvas der die Größe des Diagramms bestimmt unabhängig von der Größe des äußeren Canvas
            Diagram.viewBox.width = rect.width * Diagram.zoomFactor;
            Diagram.viewBox.height = rect.height * Diagram.zoomFactor;


            return `${Diagram.viewBox.x} ${Diagram.viewBox.y} ${Diagram.viewBox.width} ${Diagram.viewBox.height}`;
        }
        // Default viewBox if canvas is not available
        return '0 0 0 0';
    }

    public processDropEvent(e: DragEvent) {
        e.preventDefault();

        const fileLocation = e.dataTransfer?.getData(ExampleFileComponent.META_DATA_CODE);

        if (fileLocation) {
            this.fetchFile(fileLocation);
        } else {
            this.readFile(e.dataTransfer?.files);
        }
    }

    public prevent(e: DragEvent) {
        // dragover must be prevented for drop to work
        e.preventDefault();
    }

    private fetchFile(link: string) {

        this._http.get(link, {
            responseType: 'text'
        }).pipe(
            catchError(err => {
                console.error('Error while fetching file from link', link, err);
                return of(undefined);
            }),
            take(1)
        ).subscribe(content => {
            if (content === undefined) {
                return;
            }
            const fileExtension = link.split('.').pop() || '';
            this.fileContent.emit({fileContent: content, fileExtension: fileExtension});
        })
    }

    private readFile(files: FileList | undefined | null) {
        if (files === undefined || files === null || files.length === 0) {
            return;
        }
        this._fileReaderService.readFile(files[0]).pipe(take(1)).subscribe(content => {

            const fileExtension = files[0].name.split('.').pop() || '';
            this.fileContent.emit({fileContent: content, fileExtension: fileExtension});
        });
    }


    private draw() {
        if (this.drawingArea === undefined) {
            console.debug('drawing area not ready yet')
            return;
        }

        this.clearDrawingArea();

        // let groupedElements = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        // groupedElements.setAttribute('id', 'groupedSvgDiagram');
        if (this._diagram) {
            [...this._diagram.lines, ...this._diagram.places, ...this._diagram.transitions].forEach(element => {
                this.drawingArea!.nativeElement.appendChild(element.svgElement!);
                // groupedElements.appendChild(element.svgElement!);

            });

        }

        // this.drawingArea.nativeElement.appendChild(groupedElements);
    }

    private clearDrawingArea(clearElements?: boolean) {

        if(Diagram.algorithmIsActive) return
        const drawingArea = this.drawingArea?.nativeElement;
        if (drawingArea?.childElementCount === undefined) {
            return;
        }

        while (drawingArea.childElementCount > 0) {
            drawingArea.removeChild(drawingArea.lastChild as ChildNode);
        }

        //Array leeren, selektierte Elemente und Counter Variablen zurücksetzen
        if (clearElements) {
            this._diagram?.clearElements();
            this._diagram?.resetSelectedElements();
            this._diagram?.resetCounterVar();
            this._diagram?.clearOrder();
        }
    }

    private deleteLastElement() {

        if (this.activeButtonService.isReachButtonActive) {
            return;
        }

        const drawingArea = this.drawingArea?.nativeElement;
        if (drawingArea?.childElementCount === undefined) {
            return;
        }

        if (this._diagram && drawingArea.childElementCount > 0) {

            let elementOrder = this._diagram.order;
            let lastID = elementOrder.pop();

            if (lastID?.startsWith("p") && lastID.length <= 4) {
                this._diagram.places.pop();
                drawingArea.removeChild(drawingArea.lastChild as ChildNode);
            } else if (lastID?.startsWith("t") && lastID.length <= 4) {
                this._diagram.transitions.pop();
                drawingArea.removeChild(drawingArea.lastChild as ChildNode);
            } else if (lastID && lastID.length >= 5) {
                this._diagram.lines.pop();
                drawingArea.removeChild(drawingArea.firstChild as ChildNode);
            }

            this._diagram.resetSelectedElements();
            this._diagram.lightningCount = 0;
        }
    }

    onCanvasClick(event: MouseEvent) {

        // Koordinaten des Klick Events relativ zum SVG Element
        const svgElement = document.getElementById('canvas');

        if (!svgElement) {
            return;
        }
        // Position des SVG Elements relativ zum Viewport
        const svgContainer = svgElement.getBoundingClientRect();
        // Berechnung der Maus Koordinaten relativ zum SVG Element
        // und Anpassung an den Zoomfaktor, da es sonst zu einem Offset beim Klicken kommt
        const mouseX = (event.clientX - svgContainer.left) * Diagram.zoomFactor + Diagram.viewBox.x;
        const mouseY = (event.clientY - svgContainer.top) * Diagram.zoomFactor + Diagram.viewBox.y;

        // Check ob linker Mouse Button geklickt und Button aktiviert
        if (event.button === 0 && this.activeButtonService.isCircleButtonActive) {
            if(Diagram.algorithmIsActive) return
            this._drawingService.changeTokenButtonColor('black');
            let svgCircle = this._drawingService.drawCircle(mouseX, mouseY)
            svgElement.appendChild(svgCircle.svgElement!);
        } else if (event.button === 0 && this.activeButtonService.isRectangleButtonActive) {
            if(Diagram.algorithmIsActive) return
            this._drawingService.changeTokenButtonColor('black');
            let svgRect = this._drawingService.drawRect(mouseX, mouseY);
            svgElement.appendChild(svgRect.svgElement!);
        }


        // Kante von Transition zu Stelle zeichnen
        else if (event.button === 0 && this.activeButtonService.isArrowButtonActive) {
            
            if (this._diagram!.selectedRect) {
                this._diagram!.lightningCount = 0;
                if (this._diagram!.selectedCircle) {
                    let targetIsCircle: boolean = true;
                    this._drawingService.connectElements(this._diagram!.selectedCircle, this._diagram!.selectedRect, targetIsCircle);
                }
            }
        }

        // Kante von Stelle zu Transition zeichnen
        else if (event.button === 0 && this.activeButtonService.isArrowButtonActive) {
            if (this._diagram!.selectedCircle) {
                this._diagram!.lightningCount = 0;
                if (this._diagram!.selectedRect) {
                    let targetIsCircle: boolean = false;
                    this._drawingService.connectElements(this._diagram!.selectedCircle, this._diagram!.selectedRect, targetIsCircle);
                }
            }
        }

        // Blitz-Tool
        else if (event.button === 0 && this.activeButtonService.isBoltButtonActive) {
            
            if(Diagram.algorithmIsActive) return
            this._drawingService.changeTokenButtonColor('black');

            // Überprüfen, ob ein Place oder eine Transition angeklickt wurde
            const clickedPlace = this._diagram!.places.find(place => place.isClicked(mouseX, mouseY));
            const clickedTransition = this._diagram!.transitions.find(transition => transition.isClicked(mouseX, mouseY));

            if (clickedPlace) {
                // Aktualisieren Sie den ausgewählten Kreis
                this._diagram!.selectedCircle = clickedPlace;

                this._diagram!.selectedRect = undefined;
                this._diagram!.lightningCount = 1;
            } else if (clickedTransition) {
                // Aktualisieren Sie die ausgewählte Transition
                this._diagram!.selectedRect = clickedTransition;

                this._diagram!.selectedCircle = undefined;
                this._diagram!.lightningCount = 0;
            } else {
                if (this._diagram!.lightningCount === 0) {
                    let targetIsCircle: boolean = true;
                    let svgCircle = this._drawingService.drawCircle(mouseX, mouseY);
                    svgElement.appendChild(svgCircle.svgElement!);
                    // Gerade erzeugtes Kreisobjekt als selected Circle setzen
                    const lastCircleObject = this._diagram!.places[this._diagram!.places.length - 1];
                    if (lastCircleObject.svgElement) {
                        this._diagram!.selectedCircle = lastCircleObject;
                    }
                    this._diagram!.lightningCount++;

                    // Verbinden der Elemente
                    if (this._diagram!.selectedRect !== undefined && this._diagram!.selectedCircle !== undefined) {
                        this._drawingService.connectElements(this._diagram!.selectedCircle, this._diagram!.selectedRect, targetIsCircle);
                    }

                    return;
                } else if (this._diagram!.lightningCount === 1) {
                    let targetIsCircle: boolean = false;
                    let svgRect = this._drawingService.drawRect(mouseX, mouseY);
                    svgElement.appendChild(svgRect.svgElement!);
                    // Gerade erzeugtes Rechteckobjekt als selected Rect setzen
                    const lastRectObject = this._diagram?.transitions[this._diagram?.transitions.length - 1];
                    if (lastRectObject?.svgElement) {
                        this._diagram!.selectedRect = lastRectObject;
                    }
                    this._diagram!.lightningCount--;

                    // Verbinden der Elemente
                    if (this._diagram!.selectedRect !== undefined && this._diagram!.selectedCircle !== undefined) {
                        this._drawingService.connectElements(this._diagram!.selectedCircle, this._diagram!.selectedRect, targetIsCircle);
                    }

                    return;
                }
            }
        }
    }

    handleRightClick(event: MouseEvent) {
        event.preventDefault(); // Kontextmenü mit Rechtsklick verhindern
        if (this.activeButtonService.isBoltButtonActive) {

            this._diagram?.resetSelectedElements();
            this._diagram!.lightningCount = 0;
        }
    }

    generateReachabilityGraph() {

        const svgElement = document.getElementById('canvas');

        if (this.activeButtonService.isReachButtonActive) {

            this.clearDrawingArea();

            let graph = new ReachabilityGraph(this._diagram!, this._springEmbedderService);

            graph.createReachabilityGraph();

        } else {

            this.clearDrawingArea();

            this._diagram!.places.forEach(place => {
                let svgPlace = place.createSVG();
                svgElement?.appendChild(svgPlace);
            });

            this._diagram!.transitions.forEach(transition => {
                let svgTransition = transition.createSVG();
                svgElement?.appendChild(svgTransition);
            });

              this._diagram!.lines.forEach(line => {
                let svgLine = line.svgElement;
                svgElement?.insertBefore(svgLine!,svgElement.firstChild);
              });


        }
    }
}
