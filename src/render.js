const {ipcRenderer}=require('electron');

//DATA-----
const db=require('electron-db');
db.createTable('tasks',(s,msg)=>{
    //s -> bool tells if call is successful
    console.log("Table Creation Success: "+s);
    console.log("DB Msg: "+msg);
})
var CurrentID=0;
var TaskArray=[];

db.getAll('tasks',(s,data)=>{
    console.log("Initial Data Transfer Complete?: "+s);
    TaskArray=data[0];
    if(TaskArray.length){
        CurrentID=TaskArray.reduce((a,b)=>a.id>b.id?a:b).id+1;
    }
    console.log("Current id: "+CurrentID);
})

ipcRenderer.on('app-close', _ => {
    if (db.valid('tasks')) {
        //clear the json file
        db.clearTable('tasks', (s, msg) => {
            if (s) {
                console.log(msg)
            }
        })
        //update the json file
        db.insertTableContent('tasks', TaskArray, (succ, msg) => {
            // succ - boolean, tells if the call is successful
            console.log("Success: " + s);
            console.log("Message: " + msg);
        })
    }
       
});

//SELECTORS-----
const addTaskBtn=document.querySelector('.add-task-btn');
const cancelBtn=document.querySelector('.cancel-task-btn')
const taskIn=document.querySelector('.task-name');
const dueIn=document.querySelector('.due-date');
const prioIn=document.querySelector('.priority');
const notesIn=document.querySelector('.notes');

const taskUl=document.querySelector('.task-ul');
const notesDiv=document.querySelector('.notes-modals');

//EVENT LISTENERS-----
addTaskBtn.addEventListener('click',addTaskData);
cancelBtn.addEventListener('click',function(){
    var instance = M.Collapsible.getInstance(document.querySelector(".add-collapsible"));
    instance.close();
    clearTextInput();
})


refreshTasks();

//FUNCTIONS-----
function clearTextInput(){
    taskIn.value="";
    dueIn.value=null;
    notesIn.value="";
    prioIn.value="low";
    changePriorityColor();
}

function changePriorityColor(){
    var priorityVal=prioIn.value;
    if(priorityVal=="low"){
      prioIn.style.borderColor="green";
    }
    else if(priorityVal=="med"){
      prioIn.style.borderColor="orange";
    }
    else{
      prioIn.style.borderColor="red";
    }
}

function displayNote(id){
    console.log("display div clicked: "+id);
    const noteContent=document.getElementById("note-content");
    noteContent.innerHTML=TaskArray.find(task=>task.id==id).notes;
}

function changeCompleted(id){
    var completed=TaskArray.find(task=>task.id==id).completed;
    if (completed==true){
        TaskArray.find(task=>task.id==id).completed=false;
    }else{
        TaskArray.find(task=>task.id==id).completed=true;
    }
    console.log(TaskArray.find(task=>task.id==id));
    taskUl.innerHTML="";
    refreshTasks();
}

function deleteTask(id){
    TaskArray=TaskArray.filter(task=>task.id!=id);
    taskUl.innerHTML="";
    refreshTasks();
}

function addTaskHTML(id,taskName,dueDate,priority,notes,completed){
    //task div
    const taskDiv=document.createElement('div');
    taskDiv.classList.add("task");
    taskDiv.id=id;


    //create li
    const taskLi=document.createElement("li");
    taskLi.innerHTML=taskName;
    taskLi.classList.add("modal-trigger");
    taskLi.setAttribute("href","#modal-display");
    taskLi.setAttribute("onclick","displayNote("+id+");");
    if(priority=="high"){
        taskDiv.style.borderLeftColor="red";
    }
    else if(priority=="med"){
        taskDiv.style.borderLeftColor="orange";
    }

    //due date display
    if(dueDate!=""){
        const dueDisplay=document.createElement("div");
        dueDisplay.classList.add("due-display");
        dueDisplay.innerHTML="Due: "+dueDate;
        taskLi.appendChild(dueDisplay);
    }

    taskDiv.appendChild(taskLi);

    //createicons
    const delBtn=document.createElement("a");
    delBtn.classList.add("secondary-content")
    delBtn.setAttribute("onclick","deleteTask("+id+")");

    const delBtnIcn=document.createElement("i");
    delBtnIcn.classList.add("material-icons");
    delBtnIcn.classList.add("icon-red");
    delBtnIcn.innerHTML="delete_forever";
    delBtn.append(delBtnIcn);

    const chkBtn=document.createElement("a");
    chkBtn.classList.add("secondary-content");
    chkBtn.setAttribute("onclick","changeCompleted("+id+")");

    const chkBtnIcn=document.createElement("i");
    chkBtnIcn.classList.add("material-icons");

    //alters apperance when checked
    if(completed==false){
        chkBtnIcn.innerHTML="check_box_outline_blank";
    }else{
        taskLi.style.textDecoration="line-through";
        chkBtnIcn.innerHTML="check_box";
        taskDiv.style.borderLeftColor="gray";
    }
    
    chkBtn.append(chkBtnIcn);

    taskDiv.appendChild(delBtn);
    taskDiv.appendChild(chkBtn);

    //append everything to the end of the list
    taskUl.appendChild(taskDiv);
}


//adding a task
function addTaskData(){
    //implement
    const id=CurrentID;
    event.preventDefault();
    const taskName=taskIn.value;
    var dueDate=null;
    dueDate=dueIn.value;
    const priority=prioIn.value;
    const notes=notesIn.value;
    
    const taskObj={
        id,
        taskName,
        dueDate,
        priority,
        notes,
        completed:false
    };

    if(taskName!=""){
        CurrentID=CurrentID+1;
        TaskArray.push(taskObj);
        console.log(TaskArray);
        taskUl.innerHTML="";
        refreshTasks();
    }
    
    //close the expandable
    var instance = M.Collapsible.getInstance(document.querySelector(".add-collapsible"));
    instance.close();
    clearTextInput();
}

function refreshTasks(){
    TaskArray.forEach(task=>addTaskHTML(task.id,task.taskName,task.dueDate,task.priority,task.notes,task.completed));
}


