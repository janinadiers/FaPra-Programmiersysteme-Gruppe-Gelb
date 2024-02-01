import { Diagram } from './diagram';
import { Transition } from './transition';
import { State } from './state';
import { Line } from './line';

export class ReachabilityGraph {

    private readonly _diagram: Diagram;
    private _currentState: Array<State>;
    private _newStates: Array<State>;
    private _visited: Array<State>;
    private _activeTransitions: Array<Transition>;
    private iteration: number = 0 ;
    private id: number = 0;
    private sameLevel: Array<State> = [];
    
   
    constructor(diagram: Diagram, private _springEmbedderService: any) {
      this._diagram = diagram;
      this._currentState = [];
      this._newStates = [];
      this._activeTransitions = [];
      this._visited = [];
      this._springEmbedderService = _springEmbedderService;
    }

    createReachabilityGraph(){

        if(this.iteration === 0){
            this.getInitialState();
        }
        do {
            this.exploreStates();
        } while ((this._currentState.length > 0 || this._newStates.length > 0) && this._visited.length <  150);

        if (this._visited.length < 150) {
            this.moveNodes();
            this.drawGraph();
            this._springEmbedderService.apply(this._visited);
            
        }
        else{
            alert("The number of states has exceeded a threshold of 150!")
        }
    }
  
    getInitialState(){

        let initialState = new Map<string, number>();

        this._diagram.places.forEach(place => {
            initialState.set(place.id, place.amountToken);
          });
          
          let currentState = new State (this.iteration, this.id, initialState);
          this._currentState.push(currentState);
          currentState.level = 0;
          currentState.x = 50;
          currentState.y = 180;
    }


    exploreStates() {
        // Erkunde aktivierte Transitionen im momentanen Zustand 
        // Start der Itaration
        this.iteration++;
        this.id = 0;

        this.isTransitionActive();
    
        let amount: number = this._activeTransitions.length;
        if (amount > 0) {
            for (let i = 0; i < amount; i++) {
                // Aktive Transition feuern und aus Array entfernen
                let activeTransition = this._activeTransitions.shift();
                if (activeTransition !== undefined) {
                    this.fireTransition(activeTransition);
                }
            }   
            this.removeRedundantStates();
            this.compareWithCurrentState();
            this.compareWithVisitedStates();
            this.separateNodes();
            this.setVisited();     
        }  
        else{
            this.setVisited();    
            return;
        }     
    }

    
    isTransitionActive() {
        
        const transitions = this._diagram?.transitions;
        const lines = this._diagram?.lines;
        let connectedLines: Array<Line> = [];
        let placesWithEnoughTokens: number = 0;
        

        if (transitions && lines) {
            for (let i = 0; i < transitions.length; i++){
                
                // Alle verbundenen Lines ermitteln und im Array speichern
                for (let j = 0; j < lines.length; j++){
                    if(lines[j].target.id === transitions[i].id){
                        connectedLines.push(lines[j]);
                    }
                } 
                connectedLines.forEach(line => {
                    let placeToken = this._currentState[0].state.get(line.source.id)
                    if (placeToken! >= line.tokens){
                        placesWithEnoughTokens++;
                    }
                });

                if(placesWithEnoughTokens === connectedLines.length){
                    this._activeTransitions.push(transitions[i]);
                }
              
                connectedLines.splice(0, connectedLines.length);
                placesWithEnoughTokens = 0;
            }
        }
    }
    

    fireTransition(activeTransition: Transition) {
        
        const lines = this._diagram?.lines;
        let currentState = this._currentState[0];
        let state = new Map<string, number>([...currentState.state]);
        let connectedLines: Array<Line> = [];

        lines.forEach(line => {
            if(line.target.id === activeTransition.id){
                connectedLines.push(line);
            }
        });

        // Tokens im Vorbereich abziehen
        connectedLines.forEach(line => {
            let placeID = line.source.id;
            let placeToken = state.get(placeID);
            placeToken = placeToken! - line.tokens;
            state.set(placeID, placeToken);
        });
        
        connectedLines.splice(0, connectedLines.length);

        lines.forEach(line => {
           if (line.source.id === activeTransition.id){
                connectedLines.push(line); 
           }
        });
        // Tokens im Nachbereich hinzufügen
       connectedLines.forEach(line => {
            let placeID = line.target.id;
            let placeToken = state.get(placeID);
            placeToken = placeToken! + line.tokens;
            state.set(placeID, placeToken);   
        });
        connectedLines.splice(0, connectedLines.length);
        
        this.id++;
        let newState = new State(this.iteration, this.id + Math.random(), state);
        newState.firedTransitions = activeTransition.id;
        this._newStates.push(newState);

        newState.parents = currentState;
        newState.level = (currentState.level) + 1;

        newState.x = this._currentState[0].x + 140;
        newState.y = this._currentState[0].y;
        this.sameLevel.push(newState);
    }
  

    setVisited(){

        if(this._currentState.length > 0 ){
            let visitedState = this._currentState.shift()
            this._visited.push(visitedState!);
        }
        if(this._newStates.length > 0 ){
            let newCurrentState = this._newStates.shift();
            this._currentState.push(newCurrentState!);
        }
    }

    drawGraph(){
        this._visited.forEach(state => {
            state.drawState();   
          });
    }

    separateNodes(){
        // Aufeinander liegende SVG Kreise verschieben
        let offset: number = 40;  

        if (this.iteration === 1){

            for (let i = 0; i < this.sameLevel.length; i++){
                this.sameLevel[i].y = this.sameLevel[i].parents[0].y + (offset);
                offset = offset * (-1);
                
                let m: number = 1;
                if (i == m){
                    offset = offset + 120;
                     m = m +2
                }   
            }  

        }
        else{
            for (let i = 1; i < this.sameLevel.length; i++){
                
                if( this.sameLevel[i].y < 180 ){

                    this.sameLevel[i].y = this.sameLevel[i].parents[0].y - offset;
                }
                else{
                    this.sameLevel[i].y = this.sameLevel[i].parents[0].y + offset;
                }
                offset = offset + 40;
            }
        }
       this.sameLevel.splice(0, this.sameLevel.length);
    }


    moveNodes(){
        // Nochmal aufeinander liegende SVG Kreise verschieben
        let count: number = 0;
        for (let i = 1; i < this._visited.length; i++){

           let currentX = this._visited[i].x;
           let currentY = this._visited[i].y;

            for (let k = 0; k < i; k++){

              let x = this._visited[k].x;
              let y = this._visited[k].y;

              if (currentX === x && currentY === y && currentY < 180 ){
                
                this._visited[i].y = this._visited[i].y - 40;
                count++;
              }
              else if(currentX === x && currentY === y && currentY > 180 ){

                this._visited[i].y = this._visited[i].y + 40;
                count++;
              }
            }
        }
        if (count > 0 ){
            this.moveNodes();
        }
    }


    removeRedundantStates() {
        if (this._newStates.length < 2) {
            return;
        }
    
        const statesToRemove: number[] = [];
    
        for (let i = 0; i < this._newStates.length; i++) {

            const currentState = this._newStates[i];
    
            for (let y = i + 1; y < this._newStates.length; y++) {

                const state = this._newStates[y];
                if (
                    currentState.level === state.level &&
                    this.areMapsEqual(currentState.state, state.state) // Gleiche Maps sind gleiche Zustände
                ) {
                    // Transferiere parents von redundanten Zustand zu bleibenden Zustand
                    currentState.transferParents([...currentState.parents, ...state.parents]);
                    // Transferiere firedTransition zum bleibenden Zustand
                    let newTransition = state.firedTransitions.shift();
                    let array = currentState.firedTransitions;
                    array.push(newTransition!);
                    
                    // Markiere redundanten Zustand für das Entfernen
                    statesToRemove.push(y);
                }
            }
        }
        // Entferne redundante Zustände
        for (let i = statesToRemove.length - 1; i >= 0; i--) {
            this._newStates.splice(statesToRemove[i], 1);
        }
    
        // Enferne Zustände ohne parents
        this._newStates = this._newStates.filter(state => state.parents.length > 0);
    }


    compareWithCurrentState(){

        const statesToRemove: number[] = [];

        for (let i = 0; i < this._newStates.length; i++){

           let newState= this._newStates[i];
           let currentState = this._currentState[0];

           if(this.areMapsEqual(newState.state, currentState.state)){

            currentState.transferParents([...currentState.parents, ...newState.parents]);

            // Transferiere firedTransition zum bleibenden Zustand
            let newTransition = newState.firedTransitions.shift();
            let array = currentState.firedTransitions;
            array.push(newTransition!);
            
            // Markiere redundanten Zustand für das Entfernen
            statesToRemove.push(i);
           }
        }
        // Entferne redundante Zustände
        for (let i = statesToRemove.length - 1; i >= 0; i--) {
            this._newStates.splice(statesToRemove[i], 1);
        }
    
        // Enferne Zustände ohne parents
        this._newStates = this._newStates.filter(state => state.parents.length > 0);
    }
    


    compareWithVisitedStates(){

        const statesToRemove: number[] = [];

        for (let i = 0; i < this._newStates.length; i++){

            let newState= this._newStates[i];

            for (let y = 0; y < this._visited.length; y++) {

                let visitedState = this._visited[y];

                if(this.areMapsEqual(newState.state, visitedState.state)){

                    visitedState.transferParents([...visitedState.parents, ...newState.parents]);
                    
                    // Transferiere firedTransition zum bleibenden Zustand
                    let newTransition = newState.firedTransitions.shift();
                    let array = visitedState.firedTransitions;
                    array.push(newTransition!);
            
                    // Markiere redundanten Zustand für das Entfernen
                    statesToRemove.push(i);
                }
            }

        }
        for (let i = statesToRemove.length - 1; i >= 0; i--) {
            this._newStates.splice(statesToRemove[i], 1);
        }
    
        // Enferne Zustände ohne parents
        this._newStates = this._newStates.filter(state => state.parents.length > 0);
    }




    areMapsEqual(map1: Map<string, number>, map2: Map<string, number>): boolean {
        if (map1.size !== map2.size) {
          return false;
        }
      
        for (const [key, value] of map1) {
          if (!map2.has(key) || map2.get(key) !== value) {
            return false;
          }
        }
      
        return true;
    }

}
