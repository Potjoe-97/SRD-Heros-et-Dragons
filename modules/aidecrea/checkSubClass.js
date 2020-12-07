import {
    ClassFeaturesHD
} from "../classFeatures.js";

export async function checkSubClass(html, data) {
    //récupérer la classe et son niveau
    let targetActor = game.actors.get(data.actor._id);
    let classes = targetActor.items.filter(cl => cl.type === "class");

    let subClassChoix = false;
    for (let classe of classes) {
        let subClass = classe.data.data.subclass;
        let clName = classe.name.toLowerCase();
        let scList = ClassFeaturesHD[clName].subclasses;
        let newlvl = classe.data.data.levels+1
         ;
        //enclencher le choix de sous-classe selon classe et niveau

        switch (clName) {
            case "barbare":
            case "barde":
            case "guerrier":
            case "moine":
            case "paladin":
            case "rôdeur":
            case "roublard":
            case "sorcier":
                if (newlvl == 3 && classe.data.data.subclass === "") {
                    subClassChoix = true
                };
                break;
            case "druide":
            case "magicien":
                if (newlvl == 2 && classe.data.data.subclass === "") {
                    subClassChoix = true
                };
                break;
            case "clerc":
            case "ensorceleur":
                if (newlvl == 1 && classe.data.data.subclass === "") {
                    subClassChoix = true
                };
                break;

        }

        //--------si choix de sous-classe open dialog
        if (subClassChoix === true) {
            subClassChoix = false;
            //----config du dialog
            let sbclCfg = {
                "targetActor": targetActor,
                "clName": clName,
                "scList": scList,
            };
            const sbclTempl = 'modules/srd-heros-et-dragons/templates/choixSubClass.html';
            const cont = await renderTemplate(sbclTempl, sbclCfg);

            //----rendu du dialog
            let subclassDialog = new Dialog({
                title: "monté de niveau",
                content: cont,
                buttons: {
                    one: {
                        label: "valider la sous-classe",
                        callback: cont => giveSubClass(cont[0].querySelector("select").value)
                    },
                    two: {
                        label: "fermer",
                    }
                },
                default: "one",
                close: () => {}
            }).render(true);

            async function giveSubClass(newsbcl) {
                //-----udater la classe avec la sous classe 
                console.log({
                    classe
                })
                const update = {
                    _id: classe.data._id,
                    name: classe.data.name,
                    data: {
                        subclass: newsbcl
                    }
                };

              targetActor.updateEmbeddedEntity("OwnedItem", update);
                

                //-------donner l'item feat de sous-classe
                let packClass = game.packs.get("srd-heros-et-dragons.h-d-classes-et-specialisations");
                let sbcItem = "[" + classe.name.toLowerCase().replace("'", "") + "] " + newsbcl.toLowerCase();
                let subcl = packClass.index.find(sc => sc.name.toLowerCase() === sbcItem);
                packClass.getEntity(subcl._id).then(sbc => {
                    targetActor.createOwnedItem(sbc);
                });
                //--------mettre le flag de sous-classe
                targetActor.setFlag("srd-heros-et-dragons", "subclasse.label", subcl.name);

                //---------récupérer la config de sous-classe
                let subConfig = CONFIG.DND5E.classFeatures[classe.name.toLowerCase()].subclasses;
                let newFeats = [];
                for (let [sub, subData] of Object.entries(subConfig)) {

                    if (subData.label == newsbcl) {
                        console.log(subData.features);
                    }
                }


            };
        }
    } 
}