


main();

async function main()
{
    const API_URL = "http://localhost:8000/api/v1/titles/";
    const nbMoviesLoad = 7;    //nombre de films téléchargés par catégorie
    const cat1 = 'action';
    const cat2 = 'animation';

    let moviesById={};  //tableau dynamique contenant tous les films clé: id du film / valeur: données du film
    let nbImg = 4; //nombre d'image afficher par catégorie
    //let indexStart;

    //le meilleur film
    let idBestMovie = await findIdBestMovie(API_URL+'?sort_by=-imdb_score&page=');
    let dataMovie = await getDatasMovieById(API_URL,idBestMovie);
    moviesById[dataMovie.id.toString()]=dataMovie;
    displayDatasBestMovie(dataMovie);

    //les autres meilleurs films
    let betsOfMovies = await getBestMovies(API_URL, idBestMovie,nbMoviesLoad, 'allCat');
    //displayBestMoviesImages(betsOfMovies, "other_best_movie");
    moviesById = findMovieById(betsOfMovies, moviesById);
    //idImageArray(betsOfMovies);
    displayAllImges(nbImg, betsOfMovies, "other_best_movie");
    
    //meilleurs films de la catégorie 1 
    let betsOfMoviesCat1 = await getBestMovies(API_URL, idBestMovie,nbMoviesLoad, cat1);
    //displayBestMoviesImages(betsOfMoviesCat1, "cat_1");
    moviesById = findMovieById(betsOfMoviesCat1, moviesById);
    displayAllImges(nbImg, betsOfMoviesCat1, "cat_1");
    
    //meilleurs films de la catégorie 2
    let betsOfMoviesCat2 = await getBestMovies(API_URL, idBestMovie,nbMoviesLoad, cat2);
    //displayBestMoviesImages(betsOfMoviesCat2, "cat_2");
    moviesById = findMovieById(betsOfMoviesCat2, moviesById);
    displayAllImges(nbImg, betsOfMoviesCat2, "cat_2");
   

    clicOnImage(moviesById);
    clickOnOpenButton(moviesById, idBestMovie);
};




function createDivImg(nbImg,container)
{
    for (i=0; i<nbImg; i++)
    //for (i in nbDiv)
    {
        let divImg = document.createElement("div");
    
        divImg.id = 'div_'+container+'_' +i.toString();
        divImg.setAttribute("class", "divImage"); 
        document.getElementById(container).appendChild(divImg);
        let newImg= document.createElement("img");
        newImg.setAttribute("class", "image"); 
        document.getElementById('div_'+container+'_' +i.toString()).appendChild(newImg);
    };  
};



function displayImg(nbImg, data, indexStart, container)
{   
             
    for(i=indexStart; i<(nbImg+indexStart); i++)
    {
        let newImage = document.querySelector('#div_'+container+'_' +(i-indexStart).toString()+">img")
        newImage.src = data[i].image_url;
        newImage.id = data[i].id;
        newImage.setAttribute("class", "image"); 
        document.getElementById('div_'+container+'_'+(i-indexStart).toString()).appendChild(newImage);

    };
};


function displayAllImges(nbImg, data, container)
// gestion de l'affichage des images des films via le carrousel
{
    const indexStart = 0;
    createDivImg(nbImg,container);
    createCarouselArrow(container);
    displayImg(nbImg, data, indexStart,container);
    carousel(nbImg,data,indexStart,container);
}






function findMovieById(data, moviesById)
//retourne le tableau {clé: id du film / valeur: données du film}
{
    for (i in data)
        {
            moviesById[data[i].id.toString()]= data[i];
        };
    return moviesById;
};

/*
function displayBestMoviesImages(data, container)
    {
        for (i in data)
        {
            displayDatas(data[i],"image_url",container);
        };
    };*/


function displayDatasBestMovie(data)
{
    let newImg = document.createElement("img");
    newImg.src = data.image_url;
    newImg.id = data.id;
    newImg.setAttribute("class", "image");         
    document.getElementById("title_best_movie").innerHTML= `<h2>${data.title}</h2>`;
    document.getElementById("description_best_movie").innerHTML= `<p>${data.description}</p>`;
    document.getElementById("best_movie").appendChild(newImg);
};


async function getBestMovies(urlApi, idBestMovie, numberMax, category)
{
    let url;
    let datasBestsMovies = [];
    if (category == 'allCat')
    {
        url = urlApi+'?sort_by=-imdb_score&page=';
    }
    else
    {
        url = "http://localhost:8000/api/v1/titles?genre=" + category + '&sort_by=-imdb_score&page='
    };

    let idArray = await getIdMovies(url, numberMax+1);
    for(i in idArray)
    {
        if (idArray[i] != idBestMovie)
        {
            let datasMovie = await getDatasMovieById(urlApi,idArray[i]);
            datasBestsMovies.push(datasMovie);
            if (datasBestsMovies.length == numberMax)
            {break;}
        };
    
    };
    return Promise.resolve(datasBestsMovies);
};



async function findIdBestMovie(urlApi)
// retourne l'id du film ayant le meilleur score Imdb et le plus grand nombre de votes (toutes catégories confondues)
{
    let voteNumber; let idMovie; let scoreMax; let nextPage = true; let page = 1;
    while (nextPage)
    {
        idBestMovie = await fetch(urlApi + page) 
            .then(response => response.json())
            .then(datas => 
                {
                    if (page === 1)
                        {
                            scoreMax = datas.results[0]['imdb_score'];
                            idMovie = datas.results[0]['id'];
                            voteNumber = datas.results[0]['votes'];
                        }
                    //for (i=0; i<datas.results.length; i++)
                    for (i in datas.results)
                        {  
                            if (datas.results[i]['imdb_score'] <scoreMax)
                            {
                                nextPage = false;
                                break;   
                            }
                            else
                            {
                                if (datas.results[i]['votes'] > voteNumber)
                                {
                                    voteNumber = datas.results[i]['votes'];
                                    idMovie = datas.results[i]['id'];
                                }
                            }
                        };
                })
            .catch(err => alert("Une erreur s'est produite", err));
            page++;
    };
    return Promise.resolve(idMovie);
};

async function getIdMovies(url, number)
// retourne la list des id du multiple de 5 immédiatement supérieur à number films les mieux notés 
{
    let idList=[];
    let nPage = Math.trunc(number/5);
    for (page=1; page<=nPage+1; page++)
    {
        await fetch(url+page)
            .then(response => response.json())
            .then(datas =>
                {       
                    //for (i=0; i<5; i++)
                    for (i in datas.results)
                    {
                        idList.push(datas.results[i].id);
                    }
                })
            .catch(err => alert("Une erreur s'est produite", err));
    };
    return Promise.resolve(idList);
};

async function getDatasMovieById(urlApi,idMovie)
// retourne les données du film dont l'id est passé en paramètre
{
    
    let dataOneMovie;
    await fetch(urlApi+idMovie) 
        .then(response => response.json())
        .then(data => 
            {
                dataOneMovie = 
                {
                    'id':data.id,
                    'image_url': data.image_url,
                    'title': data.title,
                    'gender': data.genres,
                    'publication': data.date_published,
                    'rated': data.rated,
                    'score': data.imdb_score,
                    'director' : data.directors,
                    'actors' : data.actors,
                    'durée':data.duration,
                    'pays':data.countries,
                    
                    'description': data.description,
                }
            })
        .catch(err => alert("Une erreur s'est produite", err));
    return Promise.resolve(dataOneMovie);
};


function clickOnOpenButton(movieById,idBestMovie)
{
    let openBtn = document.getElementById("openBtn");
    openBtn.onclick = function()
    {
        document.getElementById("box_modal").style.display = "block";
        displayDatasInModal(movieById[idBestMovie.toString()]);
        clickOnCloseButton();
    };


    
};


function clicOnImage(movieById)
{
    let imgCliked = document.querySelectorAll('.image');   
    for (i=0; i< imgCliked.length; i++)
    {
    imgCliked[i].addEventListener('click',  function(event) 
        {           
            document.getElementById("box_modal").style.display = "block";
            displayDatasInModal(movieById[event.path[0].id.toString()]);   
            clickOnCloseButton();
        })
    }
};


function clickOnCloseButton()
{
    let closeBtn = document.getElementById("close_btn");
    closeBtn.onclick = function()
    {
        document.getElementById("box_modal").style.display = "none";
    };

};

function displayDatasInModal(data)
{
    document.getElementById("datas_modal_text").innerHTML= 
        `<h3> ${data.title}</h3>
        <p><span class='modalItems'>Description:</span> ${data.description}  <br> 
        <span class='modalItems'>Gender(s):</span> ${data.gender} <br>
        <span class='modalItems'>Publication:</span> ${data.date_published} <br> 
        <span class='modalItems'>Rated:</span> ${data.rated} <br>
        <span class='modalItems'>Score Imdb:</span> ${data.imdb_score} <br>
        <span class='modalItems'>Director(s):</span> ${data.directors} <br>
        <span class='modalItems'>Actors:</span> ${data.actors} <br>
        <span class='modalItems'>Durée:</span> ${data.duration} <br>
        <span class='modalItems'>Pays:</span> ${data.countries} <br>
        </p> `; 
    //let modalImg = document.createElement("img");
    let modalImg = document.querySelector("#modal_img");
    modalImg.src = data.image_url;
   //console.log(data.image_url);
    //console.log(modalImg);
    //modalImg.id = data.id + '_modal';
    //modalImg.setAttribute("class", "imageModal"); 
    //document.getElementById("img").appendChild(modalImg);
    //document.getElementById("datas_modal_img").HTMLImageElement.modalImg;
};



function createCarouselArrow(container)
{
    let divArrowLeft = document.createElement("div");
    divArrowLeft.id = 'arrowLeft_'+container;
    divArrowLeft.setAttribute("class", "arrowLeft unselectable"); 
    document.getElementById(container).appendChild(divArrowLeft).textContent= "<";

    let divArrowRight = document.createElement("div");
    divArrowRight.id = 'arrowRight_'+container;
    divArrowRight.setAttribute("class", "arrowRight unselectable"); 
    document.getElementById(container).appendChild(divArrowRight).textContent= ">";

};

function carousel(nbImg,data ,indexStart,container)
{
    let arrowLeftCliked = document.querySelector('#arrowLeft_'+container);   
    
        arrowLeftCliked.addEventListener('click',  function() 
        {           
            indexStart = indexStart-1;
            if (indexStart<0)
            {
                indexStart = 0;
            } 
            displayImg(nbImg, data, indexStart,container);   
        });

    let arrowRightCliked = document.querySelector('#arrowRight_'+container);   
    
        arrowRightCliked.addEventListener('click',  function() 
        {           
            
            indexStart = indexStart+1;
            if (indexStart>(nbImg-1))
            {
                indexStart = nbImg-1;
            } 
            displayImg(nbImg, data, indexStart,container);            
        })


    
        
};


 
    




/*L’image de la pochette du film
Le Titre du film
Le genre complet du film
Sa date de sortie
Son Rated
Son score Imdb
Son réalisateur
La liste des acteurs
Sa durée
Le pays d’origine
Le résultat au Box Office
Le résumé du film*/