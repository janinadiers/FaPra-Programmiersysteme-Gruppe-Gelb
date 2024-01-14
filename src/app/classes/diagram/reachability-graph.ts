import { transition } from '@angular/animations';
import { Diagram } from './diagram';
import { Transition } from './transition';
import { State } from './state';


export class ReachabilityGraph {
    private readonly _diagram: Diagram;
    private  _currentStates: Array<State>;
    private  _newStates: Array<State>;
    private  _visited: Array<State>;
    private  _activeTransitions: Array<Transition>;
    private iteration: number = 0 ;
    private id: number = 0;
    private offsetY: number = 0;
    private offsetX: number = 0;
    private _coords: Array<State>;
   
   
    
  
    constructor(diagram: Diagram) {
      this._diagram = diagram;
      this._currentStates = [];
      this._newStates = [];
      this._activeTransitions = [];
      this._visited = [];
      this._coords = [];
    }

    createReachabilityGraph(){

        if(this.iteration == 0){
            this.getInitialState();
        }

        do {
            this.exploreStates();
          } while (this._currentStates.length > 0 || this._newStates.length > 0);

          this.drawGraph();

          console.log("Finished! There are " + this._visited.length +" States.");
          
          console.log(this._visited);

         

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
            
        }

        this.calculateCoords();

        
    
        this.setVisited();        
    }

    
    isTransitionActive() {
        let preArea: number = 0;
        let max: number = this._diagram.transitions.length;
        
        let map = new Map<string, number>();
        map = this._currentStates[0].state;
    
        for (let i = 0; i < max; i++) {
            this._diagram.transitions[i].parents.forEach(parent => {
                let token = map.get(parent.id);
                preArea = preArea + token!; 
                if (preArea >= 1) {
                    this._activeTransitions.push(this._diagram.transitions[i]);
                    
                }
                preArea = 0; 
            });
        }
    
    }
    
    fireTransition(activeTransition: Transition) {
        
       // Map mit neuem Zustand erstellen
        let preAreaPlace = activeTransition.parents[0].id;
        let postAreaPlace = activeTransition.children[0].id;
        //Neuer Zustand
        let currentState = this._currentStates[0];
        let state = new Map([...currentState.state]);

        let preTokenValue = state.get(preAreaPlace);
        
        preTokenValue!--;
        
        state.set(preAreaPlace, preTokenValue!);

        let postTokenValue = state.get(postAreaPlace);
        postTokenValue!++;
        state.set(postAreaPlace, postTokenValue!);

        this.id++;

        let newState = new State(this.iteration, this.id, state);
        this._newStates.push(newState);

        newState.parents = this._currentStates[0];
        this._currentStates[0].children = newState ;

        newState.x = this._currentStates[0].x + 140;
        newState.y = this._currentStates[0].y;

        this._coords.push(newState);


    }
  

    getInitialState(){

        let initialState = new Map<string, number>();

        this._diagram.places.forEach(place => {
            initialState.set(place.id, place.amountToken);
          });
          
          let currentState = new State (this.iteration, this.id, initialState);
          this._currentStates.push(currentState);
          currentState.x = 50;
          currentState.y = 180;

         

    }

    setVisited(){

        if(this._currentStates.length > 0 ){
            let visitedState = this._currentStates.shift()
            this._visited.push(visitedState!);

        }
        
        if(this._newStates.length > 0 ){
            let newCurrentState = this._newStates.shift();
            this._currentStates.push(newCurrentState!);
        
       
        }
    }

    

    drawGraph(){


        this._visited.forEach(state => {
            state.drawState();
            
          });
       


    }

    calculateCoords(){

        
        let offset: number = 40;  

       for (let i = 0; i < this._coords.length; i++){

            this._coords[i].y = this._coords[i].parents[0].y + (offset);

                offset = offset * (-1);

              let m: number = 1;
              
              if (i == m){
                    offset = offset + 40;
                    m = m +2
                }
        
            
       }

       this._coords.splice(0, this._coords.length);
    }
    

    
        
}