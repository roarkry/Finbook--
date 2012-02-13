var planClass = ".plan-detail";
var planGoalsClass = ".goal-detail-container";
var goalClass = ".goal-detail.dotted-top-border";
var feedbackClass = ".feedback-detail-padding";

var options;

$(document).ready(function () {
  
  /**
   * read settings using fancy-settings  api
   *
   * @see https://github.com/frankkohlhepp/fancy-settings/wiki/Read-settings
   */
  chrome.extension.sendRequest({action: 'gpmeGetOptions'}, function(theOptions) {
    options = theOptions;
    
    if(options.collapse_expand_all)
      SetupCollapseExpandAll();
  
    //Display the outlines
    if(options.outline_plans)
      $(planClass).css("border","3px solid grey");
    
    if(options.outline_goals)
      $(planGoalsClass).css("border","3px solid grey");
    
    if(options.outline_goal)  
      $(goalClass).css("border","3px solid green");
    
    if(options.outline_feedback)
      $(feedbackClass).css("border","3px solid blue");
    
    if(options.reorder_plan_by_goal){
      var goalDates = {};
      var keys = Array();
      
      //append this to each date we recieve.  
      //In case two goals were created at the same time (for different plans)
      //This will keep them from colliding in the goalDates object
      var count = 0;

      $(planGoalsClass).each(function (i){
        //get the most recent goals date (as a string)
        var x = $(this).find(".goal-detail-description-heading")[0].innerText.split("Period")[0] + (count++);
        keys.push(x);
        goalDates[x] = i;
      });
      
      SortTopLevel(goalDates, keys);      
    }
    
    //Hide the header for Goals - just says "goals"
    if(options.hide_goal_header)
      $(".goal-detail-title").each(function (i){
        this.style.display = 'none';
      });
    
    $(planClass).each(SetupPlan);
    
    $(goalClass).each(SetupGoal);
    
    $(feedbackClass).each(SetupFeedback);
    
    if(options.auto_feedback){
      $(feedbackClass).each(function(i){ExpandFeedback(i)});
    }
    
    if(options.auto_goals){
      $(goalClass).each(function(i){ExpandGoal(i)});
    }
    
    if(options.auto_plans){ 
      $(planClass).each(function(i){ExpandPlan(i)});
    }
  });
});

/************Setup Functions**************/

function SetupPlan(i){
  var plan = $(this).find('a')[0];
  var goals = $($(planGoalsClass)[i]).find(goalClass).length;
  if(goals == 1)
    goals = goals + " Goal";
  else
    goals = goals + " Goals";
  plan.outerHTML = "<span class=\"expand-plan\">[-]</span>" + plan.outerHTML + "<span class=\"expand-plan-summary\" style=\"display:none\">" + goals + "</span>";
  
  var shElement = $(".expand-plan")[i];
  shElement.addEventListener("click", function(){ExpandPlan(i);}, false);
}

function SetupGoal(i){
  var goal = $(this).find('span')[0];
  var comments = $(this).find(feedbackClass).length;
  if(comments == 1)
    comments = comments + " Comment";
  else
    comments = comments + " Comments";
  goal.innerHTML = "<span class=\"expand-goal\">[-]</span>" + goal.innerHTML + "<span class=\"expand-goal-summary\" style=\"display:none\">" + comments + "</span>";
  
  var shElement = $(".expand-goal")[i];
  shElement.addEventListener("click", function(){ExpandGoal(i);}, false);
}

function SetupFeedback(i){
  var feedback = $(this).find(".feedback-detail-date-time")[0];
  
  var creatorStr = $(this).find(".feedback-detail-creator")[0].innerText;

  feedback.innerHTML = "<span class=\"expand-feedback\">[-]</span>" + feedback.innerHTML + "<span class=\"expand-feedback-summary\" style=\"display:none\">" + creatorStr + "</span>";
    
  var shElement = $(".expand-feedback")[i];
  shElement.addEventListener("click", function(){ExpandFeedback(i);}, false);
}

function SetupCollapseExpandAll(){
  var AllGoals = $(".goals-display-container")[0];
  AllGoals.outerHTML = "<table><tr><td id='collapse-all' class='all collapse'>Collapse All</td><td id='expand-all' class='all expand'>Expand All</td></tr></table>" + AllGoals.outerHTML;
  
  var collapseDiv = $("#collapse-all");
  var expandDiv = $("#expand-all");
  
  collapseDiv.click(CollapseAll);
  expandDiv.click(ExpandAll);
}

/************Expand Functions**************/

function CollapseAll(){
  $(planClass).each(
    function(i){
      if(ExpandPlan(i) == true)
        ExpandPlan(i);
    }
  );
    
  $(goalClass).each(
    function(i){
      if(ExpandGoal(i) == true)
        ExpandGoal(i);
    }
  );
  
  $(feedbackClass).each(
    function(i){
      if(ExpandFeedback(i) == true)
        ExpandFeedback(i);
    }
  );
}

function ExpandAll(){
  $(planClass).each(
    function(i){
      if(ExpandPlan(i) == false)
        ExpandPlan(i);
    }
  );
    
  $(goalClass).each(
    function(i){
      if(ExpandGoal(i) == false)
        ExpandGoal(i);
    }
  );
  
  $(feedbackClass).each(
    function(i){
      if(ExpandFeedback(i) == false)
        ExpandFeedback(i);
    }
  );
}

function ExpandPlan(i){
  var expanded = ExpandElement($(planGoalsClass)[i]);
  
  ExpandElement($(".expand-plan-summary")[i]);
  ExpandButtonSwitch($(".expand-plan")[i], expanded);
  
  var plansElement = $(planClass)[i];
  
  var desc = $(plansElement).find(".plan-detail-expectation-description");
  if (options.collapse_plan_desc && desc.length > 0)
    ExpandElement(desc[0]);
  
  var desc = $(plansElement).find(".plan-detail-description");
  if (options.collapse_plan_desc && desc.length > 0)
    ExpandElement(desc[0]);
    
  desc = $(plansElement).find(".plan-detail-description-title");
  if (options.collapse_plan_creator && desc.length > 0)
    ExpandElement(desc[0]);
      
  desc = $(plansElement).find(".five-star-rating-control");
  if (desc.length > 0)
    ExpandElement(desc[0]);
  
  return expanded;
}

function ExpandGoal(i){
  //show child count
  var expanded = !ExpandElement($(".expand-goal-summary")[i]);
  
  //hide all feedback
  var element = $(goalClass)[i];
  $(element).children('div').each(function(i){
    ExpandElement(this);
  });
  
  //switch the expand button
  ExpandButtonSwitch($(".expand-goal")[i], expanded);
  
  //hide all description elements
  if(options.collapse_goal_desc)
    $(element).children(".goal-detail-description").each(function(i){
      ExpandElement(this);
    });
  
  if(options.collapse_goal_commentors)  
    ExpandElement($(element).children(".goal-detail-description-heading")[1]);
  
  return expanded;
}

function ExpandFeedback(i){  
  var expanded = !ExpandElement($(".expand-feedback-summary")[i]);
  
  ExpandButtonSwitch($(".expand-feedback")[i], expanded);
  
  var element = $(feedbackClass)[i];
  
  var desc = $(element).find(".five-star-rating-control");
  if (desc.length > 0)
    ExpandElement(desc[0]);
      
  desc = $(element).find(".feedback-detail-comment");
  if (options.collapse_feedback_comment && desc.length > 0)
    ExpandElement(desc[0]);
  
  desc = $(element).find(".feedback-detail-creator");
  if (desc.length > 0)
    ExpandElement(desc[0]);
  
  return expanded;
}

/************Helper Functions**************/

function ExpandElement(element){
  var expanded = false;
  
  if(element.style.display == 'none'){
    $(element).fadeIn(200 /* options.fade_speed */);
    expanded = true;
  }
  else
    $(element).fadeOut(200 /* options.fade_speed */);
    
  return expanded;
}

function ExpandButtonSwitch(element, expanded){
  if(expanded)
    element.innerText = "[-]";
  else
    element.innerText = "[+]";
}

/************Sort Functions**************/

function SwapHTML(x,y){
  var temp = x.innerHTML;
  x.innerHTML = y.innerHTML;
  y.innerHTML = temp;
}

//Help function to swap plans/Expectations
function PerformSwap(mapping, dates, i, j){
  //swap the plan-detail span and the goal-detail-container span
  SwapHTML($(planClass)[mapping[dates[i]]], $(planClass)[mapping[dates[j]]]);
  SwapHTML($(planGoalsClass)[mapping[dates[i]]], $(planGoalsClass)[mapping[dates[j]]]);
  
  //swap the indices in the mapping table
  var t = mapping[dates[i]];
  mapping[dates[i]] = mapping[dates[j]];
  mapping[dates[j]] = t;
  
  //swap the values in the array
  t = dates[i];
  dates[i] = dates[j];
  dates[j] = t;
}

//perform bubble sort - moving HTML elements as we go
function SortTopLevel(mapping, dates){
  var i, j;
  for(i=0; i<dates.length-1; i++){
    for(j=0; j<dates.length-1-i; j++){
      //Use date.js to parse and compare the dates
      var d2 = Date.parse(dates[j+1].split("       ")[0]);
      var d1 = Date.parse(dates[j].split("       ")[0]);
      
      //if the above section has an earlier date, swap them (< = descending | > = ascending
      if(d1.compareTo(d2) < 0){
        PerformSwap(mapping, dates, j, j+1);
      }
    }
  }
}