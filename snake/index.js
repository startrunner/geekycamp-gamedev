const CellStatus = {
    Wall: 1,
    Snake: 2,
    Food: 3,
    Empty: 4
};

const Direction = {
    Up: 1,
    Down: 2,
    Left: 3,
    Right: 4
};

const Key = {
    W: 87,
    A: 65,
    S: 83,
    D: 68
};

const StyleForStatus = {
    [CellStatus.Wall]: "background: black;",
    [CellStatus.Snake]: "background: green;",
    [CellStatus.Food]: "background: red;",
    [CellStatus.Empty]: "background: none;"
};

class SnakeGame{
    constructor(elementSelector, rowCount){
        this.element = document.querySelector(elementSelector);
        this.table = this.element.querySelector('table');
        this.rowCount = rowCount;
        this.colCount = rowCount;
        this.cellAt = {};
        this.statusAt = {};
        this.direction = Direction.Right;
        this.snake = new Queue();
        this.head = {x: 0, y: 0};
        this.interval = 200;
        this.inputKey = new Queue();

        for(let i=0;i<rowCount;i++){
            let tableRow = document.createElement('tr');
            for(let j=0;j<rowCount;j++){
                let tableCell = document.createElement('td');
                tableRow.appendChild(tableCell);
                let key = this.key(i, j);
                this.cellAt[key] = tableCell;
                this.statusAt[key] = CellStatus.Empty;
            }
            this.table.appendChild(tableRow);
        }

        let that = this;
        document.addEventListener('keydown', function(e){that.handleKeyboardEvent(e);});

        for(let i=0;i<rowCount;i++){
            this.setStatus(0, i, CellStatus.Wall);
            this.setStatus(i, 0, CellStatus.Wall);
            this.setStatus(rowCount-1, i, CellStatus.Wall);
            this.setStatus(i, rowCount-1, CellStatus.Wall);
        }

        for(let i=0;i<3;i++){
            this.snake.push({x: 3, y: 3+i});
            this.head = {x: 3, y: 3+i};
        }

        for(let i=0;i<5;i++)this.spawnFood(rowCount);

        setTimeout(()=>this.tick(), this.interval);
    }

    handleKeyboardEvent(e) {
        this.inputKey.push(e.keyCode);
    }

    handleInput(){
        if(!this.inputKey.any())return
        const code = this.inputKey.pop();
        if(!code)return;

        if(this.direction!=Direction.Up && this.direction!=Direction.Down){
            if(code == Key.W)this.direction = Direction.Up;
            if(code == Key.S)this.direction = Direction.Down;
        }
        else{
            if(code == Key.A)this.direction = Direction.Left;
            if(code == Key.D)this.direction = Direction.Right;
        }
    }

    spawnFood(rowCount){
        let foodX=0, foodY=0;
        while(this.getStatus(foodX, foodX)!=CellStatus.Empty){
            foodX = this.getRandomInt(2, rowCount-2);
            foodY = this.getRandomInt(2, rowCount-2);
        }
        console.log("food: ");
        console.log([foodX, foodY]);
        this.setStatus(foodX, foodY, CellStatus.Food);
    }

    tick(){
        let green = 255;
        this.handleInput();
        const moveTo = this.move(this.head.x, this.head.y, this.direction);
        const moveToStatus = this.getStatus(moveTo.x, moveTo.y);
        
        if(moveToStatus == CellStatus.Wall){
            alert("You hit a wall!");
            return;
        }
        if(moveToStatus == CellStatus.Snake){
            alert("You ate yourself!");
            return;
        }

        this.head = moveTo;
        this.snake.push(this.head);

        if(moveToStatus!=CellStatus.Food){
            let popped = this.snake.pop();
            this.setStatus(popped.x, popped.y, CellStatus.Empty);
        }
        else this.spawnFood(this.rowCount);

        this.snake.forEach(seg=>{
            this.setStatus(seg.x, seg.y, CellStatus.Snake);
            const cell = this.cellAt[(this.key(seg.x, seg.y))];
            cell.style = `background: rgba(0, ${green}, 0, 1);`;
            green = Math.max(green-5, 100);
        });

        this.interval = Math.max(this.interval - .1, 100);
        setTimeout(()=>this.tick(), this.interval);
    }

    move(x, y, direction){
        if(direction === Direction.Up)return {x: x-1, y: y};
        if(direction === Direction.Down)return {x: x+1, y: y};
        if(direction === Direction.Left)return {x: x, y: y-1};
        if(direction === Direction.Right)return {x: x, y: y+1};
        throw "Can't move";
    }

    getStatus(x, y){
        let key = this.key(x, y);
        return this.statusAt[key];
    }

    setStatus(x, y, status){
        if(x == undefined || y == undefined || status == undefined)throw "missing arg";
        let key = this.key(x, y);
        this.statusAt[key] = status;
        this.cellAt[key].style = StyleForStatus[status];
    }

    key(x, y){
        return `${x},${y}`;
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}

class Queue{
    constructor(){
        this.itemCount = 0;
        this.firstNode = null;
        this.lastNode = null;
    }

    push(x){
        if(this.itemCount == 0)this.pushFirst(x);
        else if(this.itemCount == 1)this.pushSecond(x);
        else{
            this.itemCount++;
            let newNode = this.makeNode(x, null);
            this.lastNode.next = newNode;
            this.lastNode = newNode;
        }
    }

    pushSecond(x){
        this.itemCount = 2;
        this.lastNode = this.makeNode(x, null);
        this.firstNode.next = this.lastNode;
    }
    pushFirst(x){
        this.itemCount = 1;
        this.firstNode = this.makeNode(x, null);
        this.lastNode = this.makeNode(x, null);
    }

    any(){
        return this.itemCount!=0;
    }

    peek(){
        if(this.itemCount < 1){
            throw "Can't peek an empty queue";
        }
        return this.firstNode.value;
    }

    pop(){
        if(this.itemCount < 1){
            throw "Can't pop from an empty queue";
        }

        let value = this.firstNode.value;
        this.firstNode = this.firstNode.next;
        this.itemCount--;
        return value;
    }

    forEach(toDo){
        if(this.itemCount == 0)return;
        for(let node = this.firstNode;node!=null;node=node.next){
            toDo(node.value);
        }
    }

    makeNode(x, next){
        return {value: x, next: next};
    }
}