"use strict"

// register the application module
b4w.register("Buchmodell_Blend4Web_main", function(exports, require) {

// import modules used by the app
var m_anchors   = require("anchors");
var m_app       = require("app");
var m_cfg       = require("config");
var m_data      = require("data");
var m_preloader = require("preloader");
var m_scs       = require("scenes");
var m_ver       = require("version");
// var m_mat       = require("material");

// detect application mode
var DEBUG = (m_ver.type() == "DEBUG");

// automatically detect assets path
var APP_ASSETS_PATH = m_cfg.get_assets_path("Buchmodell_Blend4Web");

/**
 * export the method to initialize the app (called at the bottom of this file)
 */
exports.init = function() {
    m_app.init({
        canvas_container_id: "main_canvas_container",
        callback: init_cb,
        show_fps: DEBUG,
        console_verbose: DEBUG,
        autoresize: true
    });
}

/**
 * callback executed when the app is initialized 
 */
function init_cb(canvas_elem, success) {

    if (!success) {
        console.log("b4w init failure");
        return;
    }

    m_preloader.create_preloader();

    // ignore right-click on the canvas element
    canvas_elem.oncontextmenu = function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    load();
}

/**
 * load the scene data
 */
function load() {
    m_data.load(APP_ASSETS_PATH + "Buchmodell_Blend4Web.json", load_cb, preloader_cb);
}

/**
 * update the app's preloader
 */
function preloader_cb(percentage) {
    m_preloader.update_preloader(percentage);
}

/**
 * callback executed when the scene data is loaded
 */
function load_cb(data_id, success) {

    if (!success) {
        console.log("b4w load failure");
        return;
    }

    m_app.enable_camera_controls();

    // CREATE ANCHOR WITH PLACEHOLDERTEXT
    //  "Generic" anchor may be created (or replaced) anytime
    //  get the Object with the name "Empty_Wp" from the 3D-scene
    //  var object1 = m_scs.get_object_by_name("Empty_Wp");
    //  create new html-counterpart for the 3D-Empty
    //  createNewAnchorDivObject("Empty_Bookholder_proxy");
    //  createNewAnchorDivObject("Empty_Bookholder_proxy.001");
    //  createNewAnchorDivObject("Empty_Bookholder_proxy.002");
    // END OF CREATION OF ANCHOR WITH PLACEHOLDERTEXT
    
}   // End of load_cb

}); // End of Moduleregistration Buchmodell_Blend4Web_main


// import the app module and start the app by calling the init method
b4w.require("Buchmodell_Blend4Web_main").init();

// My own module including callback to call it from the logic-node-editor
// check if the module already exists
if (b4w.module_check("my_module"))
    throw "Failed to register my_module";




// register my_module
b4w.register("my_module", function(exports, require) {

    // import a Blend4Web module
    var m_version = require("version");

    // create and export your own method
    exports.print_build_date = function() {

        // use a Blend4Web method
        console.log("Engine build date: " + m_version.date());
    }

/**
 * Creates a new div-object in the webseite for the corresponding empty-object in the 3D-Scene, if it not yet exist.
 * @param {String}      objectName    Name of the object
 * @returns {object}                  the html-node of the created div-object or null otherwise
 * 
 * Thanks to B4W all parameters have to be elements of an array.
 */
function createNewAnchorDivObject([objectName]) {    
    console.log("createNewAnchorDivObject: " + objectName);

    if (document.getElementById(objectName)) {          // Prüfe, ob das Div-Objekt schon erstellt wurde. Falls ja, gib null zurück.
        console.log(objectName + " already exists.");
        return null;
    } else {
        var m_anchors = require("anchors");
        var m_scs     = require("scenes");

        var emptyWp_text = document.createElement("div");
        emptyWp_text.id = objectName;
        emptyWp_text.style.position = "absolute";
        emptyWp_text.setAttribute("bookholderState", 0);          // set Startstate
    emptyWp_text.innerHTML = "<div class=\"anchorannotation\"><details><summary><img src=\"assets/wikipedia-transp.png\" alt=\"Wikipedia-Logo\" height=30 /></summary> \
    <article class=\"anchorannotationWikitext\"><header><h3>Name <small>(Art laut Wikidata)</small></h3></header> \
     ... \
     </article><div align=\"right\">(<a>Weiterlesen</a> | <a>Feedback</a> | <a href=\"https://de.wikipedia.org/wiki/Hilfe:%C3%9Cbersicht\">Mitmachen</a>)</div> \
     <hr /> \
     <footer>Quelle: <img src=\"assets/wikipedia-transp.png\" alt=\"Wikipedia-Logo\" height=20 /> <a>...</a>, <img src=\"assets/wikidata.png\" alt=\"Wikidata-Logo\" height=20 /> <a>...</a></footer> \
     </details></div>";
        document.body.appendChild(emptyWp_text);

        // update the position and visibility of the div in the website to its counterpart in the 3d-scene  //* @TODO nach Zuweisung 1x Aufruf triggern
        var object = m_scs.get_object_by_name(objectName);
        m_anchors.attach_move_cb(object, function(x, y, appearance, obj, elem) {
            var anchor_elem = document.getElementById(objectName);
            anchor_elem.style.left = x + "px";
            anchor_elem.style.top = y + "px";
            if (appearance == "visible")
                anchor_elem.style.visibility = "visible";
            else
                anchor_elem.style.visibility = "hidden";
        });
        return emptyWp_text;
    }
}

/** Set a new state for the given object.
 * 
 * @param {String}      anchorObjectName
 * @param {String}      state
 * @returns {Boolean}   success
 * 
 * Thanks to B4W all parameters have to be elements of an array.
 * 
 * state
 * # 0=startstate
 * # 1=initialised (but before download)
 * # 2=Download finisched/ (hopefully successfull)
 * # 3=Downloadproblem (download not successful)
 * 
 * @see getState() for the current state.
 */
    function setBookholderState([anchorObjectName, state]) {
        var m_scenes = require("scenes");
        var m_mat = require("material");
        var bookholderObjName = String(anchorObjectName).replace("Empty_", "");   /// Attention: Please follow the nameingconvention: Emptys in the 3D-scene should be named like their corresponding bookholderobject prefixed with "Empty_". For example: "Empty_Bookholder.001" is the empty of Bookholder.001.
        var bookholderObject = m_scenes.get_object_by_name(bookholderObjName);

        console.log("setState for "+ anchorObjectName +": "+ getBookholderState([anchorObjectName]) + " -> " + state);
        var anchor_elem = document.getElementById(anchorObjectName);
        anchor_elem.setAttribute("bookholderState", state);

        if (state === 1) {  // initialised (but before download)
            m_mat.set_nodemat_value(bookholderObject, ["Glas", "glowRed"], 0);     // deactivate the glow-red effect (which should be an visual indicator for a downloadproblem)
            m_scenes.apply_outline_anim_def(bookholderObject);                     // activate the Outline-Animation (as an visual indicator for an ongoing Download)
            return true;                                                           // Statechange successfull
        }
        if (state === 2) { // Download finisched/ (hopefully successfull)
            m_mat.set_nodemat_value(bookholderObject, ["Glas", "glowRed"], 0);     // deactivate glow-red effect (as an visual indicator for a successful download)
            m_scenes.clear_outline_anim(bookholderObject);                         // deactivate the Outline-Animation (because the download is finished)
            return true;
        }
        if (state === 3) { // Downloadproblem (download not successful)
            m_mat.set_nodemat_value(bookholderObject, ["Glas", "glowRed"], 10);     // activate glow-red effect (as an visual indicator for downloaderror)
            m_scenes.clear_outline_anim(bookholderObject);                          // deactivate the Outline-Animation (because the download is finished)
            return true;
        }
    }
    
    /** Get the current state of the given object.
     * 
     * @param   {String}        anchorObjectName
     * @returns {unresolved}    state
     * 
     * Thanks to B4W all parameters have to be elements of an array.
     */
    function getBookholderState([anchorObjectName]) {
        var anchor_elem = document.getElementById(anchorObjectName);
        var state = anchor_elem.getAttribute("bookholderState");
        return state;
    }
    
    var m_log_nodes = require("logic_nodes");
    var cb_updateAnchorAnnotation = function([anchorObjectName, url_Wp, wikiContent_Wp, url_Ws, wikiContent_Ws, wikiContent_Wd]) {
    console.log("Callback von cb_updateAnchorAnnotation.");
    console.log("Parameter:"+ anchorObjectName +", "+ url_Wp +", "+ wikiContent_Wp +", "+ url_Ws +", "+ wikiContent_Ws +", "+ wikiContent_Wd);
    
    var anchorObject = document.getElementById(anchorObjectName);

    var lemma_Wp = url_Wp.match(/^(.+\/)([^/?]+)(\?.*)$/)[2]; //  Copy the articlename with is between the url and the parameters
    var lemma_Ws = url_Ws.match(/^(.+\/)([^/?]+)(\?.*)$/)[2]; //  Copy the articlename with is between the url and the parameters
    console.log("lemma_Wp:" + lemma_Wp + ", lemma_Ws:" + lemma_Ws); // Some debug-messages; WikiData is used as is (it should be an chart in an iFrame)

    var json_Wp = JSON.parse(wikiContent_Wp);
    // If there was no article downloaded/ found set an special message.
    if (json_Wp == null ) { // Wikipediaarticle not found/ downloadproblem
        var WpText ="<details class=\"anchorannotationBody\"><summary><img src=\"assets/wikipedia-transp.png\" alt=\"Wikipedia-Logo\" width=30 /></summary>" +
                    "<article class=\"anchorannotationWikitext\"><header><h3>Wikipediaartikel '<a class=\"red\" href=\"https://de.m.wikipedia.org/wiki/" + lemma_Wp + "\">" + lemma_Wp + "</a>' nicht gefunden</h3></header>" +
                    "<p>Hierzu konnte kein Artikel gefunden werden. Klicke bitte auf den roter Link, um herauszufinden, ob du einen Artikel hierfür erstellen kannst.</p>" +
                    "<p>Sollte sich die Internetseite nicht öffenen lassen, überprüfe bitte deine Internetverbindung.</p>" +
                    "</article><div align=\"right\">(<a href=\"https://de.wikipedia.org/wiki/Hilfe:%C3%9Cbersicht\">Wikipedia-Hilfe</a>)</div>" +
                    "</details>";
        setBookholderState([anchorObjectName, 3]);
    } else {                // Download successfull
        var WpText ="<details class=\"anchorannotationBody\"><summary><img src=\"assets/wikipedia-transp.png\" alt=\"Wikipedia-Logo\" width=30 /></summary>" +
                    "<article class=\"anchorannotationWikitext\"><header><h3>"+ json_Wp.displaytitle +" <small>("+ json_Wp.description +")</small></h3></header>" +
                    json_Wp.sections[0].text +
                    "</article><div align=\"right\">(<a href=\"https://de.m.wikipedia.org/wiki/"+ lemma_Wp +"\">Weiterlesen</a> | <a href=\"https://de.m.wikipedia.org/wiki/Diskussion:"+ lemma_Wp +"\">Feedback</a> | <a href=\"https://de.wikipedia.org/wiki/Hilfe:%C3%9Cbersicht\">Mitmachen</a>)</div>" +
                    " <hr />" +
                    "<footer>Quelle: <img src=\"assets/wikipedia-transp.png\" alt=\"Wikipedia-Logo\" height=20 /> <a href="+ url_Wp +">https://de.m.wikipedia.org/wiki/"+ lemma_Wp +"</a>, <img src=\"assets/wikidata.png\" alt=\"Wikidata-Logo\" height=20 /> <a href=\"https://www.wikidata.org/wiki/"+ json_Wp.wikibase_item +"\">"+ json_Wp.wikibase_item +"</a></footer>" +
                    " </details>";   
        setBookholderState([anchorObjectName, 2]);
    }
    
    var json_Ws = JSON.parse(wikiContent_Ws);
    // If there was no article downloaded/ found set an special message.
    if (json_Ws == null ) { // Wikisourcearticle not found/ downloadproblem
        var WsText ="<details class=\"anchorannotationBody\"><summary><img src=\"assets/wikisource.png\" alt=\"Wikisource-Logo\" width=30 /></summary>" +
                    "<article class=\"anchorannotationWikitext\"><header><h3>Wikisourceartikel '<a class=\"red\" href=\"https://de.m.wikisource.org/wiki/" + lemma_Ws + "\">" + lemma_Ws + "</a>' nicht gefunden</h3></header>" +
                    "<p>Hierzu konnte kein Artikel gefunden werden. Klicke bitte auf den roter Link, um herauszufinden, ob du einen Artikel hierfür erstellen kannst.</p>" +
                    "<p>Sollte sich die Internetseite nicht öffenen lassen, überprüfe bitte deine Internetverbindung.</p>" +
                    "</article><div align=\"right\">(<a href=\"https://de.wikisource.org/wiki/Wikisource:Hilfe\">Wikisource-Hilfe</a>)</div>" +
                    "</details>";
        setBookholderState([anchorObjectName, 3]);
    } else {                // Download successfull
        var WsText =" <details class=\"anchorannotationBody\"><summary><img src=\"assets/wikisource.png\" alt=\"Wikisource-Logo\" width=30 /></summary>" +
                    "<article class=\"anchorannotationWikitext\"><header><h3>"+ json_Ws.displaytitle +" <small>("+ json_Ws.description +")</small></h3></header>" +
                    json_Ws.sections[0].text +
                    "</article><div align=\"right\">(<a href=\"https://de.m.wikisource.org/wiki/"+ lemma_Ws +"\">Weiterlesen</a> | <a href=\"https://de.m.wikisource.org/wiki/Diskussion:"+ lemma_Ws +"\">Feedback</a> | <a href=\"https://de.wikisource.org/wiki/Wikisource:Hilfe\">Mitmachen</a>)</div>" +
                    "<hr />" +
                    "<footer>Quelle: <img src=\"assets/wikisource.png\" alt=\"Wikisource-Logo\" height=20 /> <a href="+ url_Ws +">https://de.m.wikisource.org/wiki/"+ lemma_Ws +"</a>, <img src=\"assets/wikidata.png\" alt=\"Wikidata-Logo\" height=20 /> <a href=\"https://www.wikidata.org/wiki/"+ json_Ws.wikibase_item +"\">"+ json_Ws.wikibase_item +"</a></footer>" +
                    "</details>";
        setBookholderState([anchorObjectName, 2]);
    }

        // Wikidata will be viewed as a chart in an iFrame (this means: no download or parsing)
        var WdText ="<details class=\"anchorannotationBody\"><summary><img src=\"assets/wikidata.png\" alt=\"Wikidata-Logo\" width=30 /></summary>" +
                    "<article class=\"anchorannotationWikitext\"><header><h3>Diagrammtittel"+ " <small>(Typ"+ ")</small></h3></header>" +
                    wikiContent_Wd +       // SPARQL per query.wikidata.org-iFrame eingebunden.
                    "</article><div align=\"right\">(<a href=\"https://www.wikidata.org/wiki/Help:Contents\">Mitmachen</a>)</div>" +
                    " <hr />" +
                    "<footer> Diese Ansicht ist auf 50 Einträge begrenzt.</footer>" +
                    " </details>";   

        anchorObject.innerHTML = "<div class=\"anchorannotation\">" + WpText + WsText + WdText + "</div>";
    }

    // Registering of function which should be available in Blenders nodeeditor
    m_log_nodes.append_custom_callback("cb_updateAnchorAnnotation", cb_updateAnchorAnnotation);
    m_log_nodes.append_custom_callback("setBookholderState", setBookholderState);
    m_log_nodes.append_custom_callback("getBookholderState", getBookholderState);
    m_log_nodes.append_custom_callback("createNewAnchorDivObject", createNewAnchorDivObject);
});

// import the module
var m_my_module = b4w.require("my_module");

// use a module's method
// m_my_module.print_build_date();