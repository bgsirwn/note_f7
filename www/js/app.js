// réaction à l'évènement app.Ready
function onAppReady() {
    
    // On utilise le UI Framework Framework7 (framework7.io)
    // *****************************************************
    
    // initialisation de Framework7
    var f7App = new Framework7();
    
    // on désire utiliser la bibliothèque Dom7
    // (sorte de 'clone light' de jQuery)
    var $$ = Dom7;
    
    // initialisation de la vue principale
    var mainView = f7App.addView('.view-main',{
        // activation des inline pages de Framework7
        // (toutes les pages décrites dans index.html)
        domCache: true 
    });
    
    
    // Application
    // ***********
    var NOTEAPP = {
        
        // fonction d'initialisation
        // *************************
        init: function(){
            // écouteurs
            this.bindings();
            // affichage de la liste des notes mémorisées
            this.displayNotes();
        },
        
        // récupère les notes présentes dans localStorage
        // et retourne un objet JSON (objet vide si aucune note)
        // *****************************************************
        getNotes: function(){
            // on récupère les notes éventuelles sauvegardées dans localStorage
            // (objet JSON)
            // si la clé 'note++' existe dans localStorage et n'est pas 'vide'...
            // (c-à-d si au moins une note est sauvegardée)
            if(localStorage['note++'] != undefined && localStorage['note++'] != ''){
                // ... on désérialise l'objet JSON stocké
                var objNotes = JSON.parse(localStorage['note++']);
            }
            // s'il n'y a pas encore de note sauvegardée
            else{
                // on crée un objet vide
                var objNotes = {};
            };
            return objNotes;             
        },
        
        // affiche les notes actuellement présentes dans localStorage
        // dans la List View de homePage
        // **********************************************************
        displayNotes: function(){
           
            // on retire tous les éléments éventuellement présents dans la List View
            // (car on va ajouter à la List View toutes les notes présentes dans localStorage)
            // nb: on retire tous les élément de classe .note afin de ne pas retirer
            // l'élément #noNotes (susceptible de devoir être rendu visible si plus aucune
            // note n'est enregistrée) ni l'élément de classe .template qui doit toujours
            // exister pour pouvoir être dupliqué lorsque l'on ajoute une note à la List View
            
            $$('#notesList li.note').remove();
            
            // on récupère les notes éventuelles sauvegardées dans localStorage
            // (objet JSON) - appel à la méthode getNotes() 
            
            var objNotes = this.getNotes();
            
            // on affiche toutes les notes présentes dans l'objet JSON objNotes dans la List View
            // si l'objet JSON n'est pas vide...
            // (nb : la méthode $.isEmptyObject() n'est pas clônée dans DOM7,
            // on utilise la technique classique en vanilla Javascript pour tester si un objet
            // est vide)
            if(! (Object.keys(objNotes).length === 0 && objNotes.constructor === Object)){
                // on parcours toutes les notes présentes dans l'objet JSON
                // (rappel boucle Javascript for...in parcourt toutes les propriétés d'un objet)
                for(n in objNotes){
                    // on clone l'élément li de classe template
                    // (modèle d'élément de la List View)
                    // nb: Dom7 ne propose pas la méthode clone() de jQuery
                    // (ici, on utilise la méthode cloneNode de Javascript qui permet de cloner
                    // un élément du DOM)
                    var newItem = $$('#notesList .template')[0].cloneNode(true);
                    // pour différencier un item 'normal' du template
                    $$(newItem).addClass('note').removeClass('template').show();
                    // on place le titre de la note comme titre de l'élément de List View
                    $$('.item-title', newItem).text(n);
                    // on ajoute le nouvel élément à la List View
                    $$('#notesList').append(newItem);
                };       

                // on cache l'élément 'Vous n'avez pas encore de note' 
                $$('#noNotes').hide();

            }
            else{
                // on affiche l'élément 'Vous n'avez pas encore de note'
                // car on n'a aucune note à afficher
                $$('#noNotes').show();
            } 
            
        },
        
        // ajoute une note dans localStorage
        // *********************************
        addNote: function(title, content){
             // on récupère les notes sauvegardées dans le localStorage
            var objNotes = this.getNotes();

            // on ajoute une note à l'objet JSON
            objNotes[title] = content;

            // on sauve la version sérialisée de l'objet modifié
            // dans le localStorage
            localStorage['note++'] = JSON.stringify(objNotes);           
        },
        
        // efface une note dans le LocalStorage
        // *************************************
        deleteNote: function(noteTitle){
                // on récupère toutes les notes stockées dans localStorage
                var objNotes = this.getNotes();
                // on efface la note sélectionnée
                delete objNotes[noteTitle];
                // on sauve l'objet JSON modifié dans le localStorage
                localStorage['note++'] = JSON.stringify(objNotes);
        },
        
        // gestionnaires d'évènements
        // **************************
        bindings: function(){
                
                // on sauve le contexte de l'application
                // *************************************
                var _noteapp = this;
        
                // gestionnaire de l'évènement click sur le bouton 'Ajouter'
                // ********************************************************
                $$(document).on('click','#addNoteBtn',function(){

                    // on récupère le titre et le contenu de la note
                    var noteTitle = $$('#noteTitle').val();
                    var noteContent = $$('#note').val();
                    
                    // on ajoute la note à la liste
                    if(noteTitle != ''){
                        _noteapp.addNote(noteTitle, noteContent);
                        _noteapp.displayNotes();
                    }
                    
                    // on vide les 2 inputs
                    $$('#noteTitle').val('');
                    $$('#note').val('');
                    
                });
            
                // gestionnaire de l'évènement click sur un lien de la liste des notes
                // *******************************************************************
                $$(document).on('click', '#notesList a.item-content', function(e){
                
                    e.preventDefault();
                    
                    // on charge une page de détail de note
                    // ************************************
                    
                    // on récupère toutes les notes stockées dans localStorage
                    var objNotes = JSON.parse(localStorage['note++']);
                    
                    // on récupère la note qui correspond au lien sur lequel on a cliqué
                    var noteTitle = $$(this).text();
                    var noteContent = objNotes[noteTitle];
                    
                    // on prépare le contenu de la page de détail
                    $$("[data-page='detailsPage'] .page-content .noteTitle").text(noteTitle);
                    $$("[data-page='detailsPage'] .page-content .noteContent").text(noteContent);
                    
                    // on attache une donnée sous la forme clé/valeur au bouton de suppression
                    $$("[data-page='detailsPage'] #deleteBtn").data('noteTitle', noteTitle);
                    
                    // on dirige l'utilisateur vers la page de détail
                    mainView.router.load({pageName: 'detailsPage'}); 
                
                });
                
                // gestionnaire de l'évènement click sur le bouton effacer de la page de détail
                // ****************************************************************************
                $$(document).on('click', "[data-page='detailsPage'] #deleteBtn", function(e){
                   
                    // on efface la note sélectionnée dans le localStorage
                    var noteTitle = $$(this).data('noteTitle');
                    _noteapp.deleteNote(noteTitle);
                    
                    // on affiche la List View modifiée
                    _noteapp.displayNotes();
                    
                    // on retourne à la page principale
                    mainView.router.load({pageName: 'homePage'}); 
                    
                });
        }
        
    }
    // Initialisation de l'application
    // *******************************
    NOTEAPP.init();
    
}
// on écoute l'évènement app.Ready généré par le fichier www/xdk/init-dev.js
document.addEventListener("app.Ready", onAppReady, false) ;