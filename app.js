
const API_URL = "http://localhost:8000/api/v1/titles/";
const API_URL_GENDER = "http://localhost:8000/api/v1/titles?genre=";


let idBestMovie;
let page = 1;

let idTab = [];
let datasMovie ={};
let theSevenBestMovies = [];

let cat1 = 'action';
let theSevenBestMoviesCat1 = [];
let cat2 = 'drama';
let theSevenBestMoviesCat2 = [];

main();

async function main()
{
    await findIdBestMovie();
    
    await getDatasMovieById(idBestMovie);
    
    displayDatas(datasMovie,'title', "title_best_movie");
    displayDatas(datasMovie,'description', "description_best_movie");
    displayDatas(datasMovie,'image_url', "img_best_movie");
    await getSevenBestMovies(API_URL+ "?sort_by=-imdb_score&page=", idBestMovie);
    

    displaySevenImages(theSevenBestMovies, "img_best_movie_");
    await getSevenBestMoviesCat(API_URL_GENDER+ cat1 +'&sort_by=-imdb_score&page=','cat1');
    displaySevenImages(theSevenBestMoviesCat1, "img_best_movie_cat1_");

}

function displaySevenImages(data, selector)
    {
        for (i in data)
        {
            displayDatas(data[i],"image_url",selector + i);
        };
    };



function displayDatas(data,dataName,selector)
{
    switch (dataName) 
    {
        case 'title':
            document.getElementById(selector).innerHTML= `<h2>${data.title}</h2>`;
            break;
        case 'description':
            document.getElementById(selector).innerHTML= `<p>${data.description}</p>`;
            break;
        case 'image_url':
            document.getElementById(selector).src=data.image_url;
            break;
    };


};


async function getSevenBestMovies(url, idBestMovie, category)
{
    await getIdMovies(url, 8);
    console.log(idTab);
    for(i in idTab)
    {
        if (idTab[i] != idBestMovie)
        {
            await getDatasMovieById(idTab[i]);
            theSevenBestMovies.push(datasMovie);
        };
    
    };
    return theSevenBestMovies;   
};

async function getSevenBestMoviesCat(url, category)
{
    await getIdMovies(url, 7);
        switch (category)
        {
            case 'cat1':
                {
                    for(i in idTab)
                    {
                        await getDatasMovieById(idTab[i]);
                        theSevenBestMoviesCat1.push(datasMovie);
                    };
                    return theSevenBestMoviesCat1;
                };
            case 'cat2':
                {
                    for(i in idTab)
                    {
                        await getDatasMovieById(idTab[i]);
                        theSevenBestMoviesCat2.push(datasMovie);
                    };
                    return theSevenBestMoviesCat2;
                };
        };
    
};


async function findIdBestMovie()
// retourne l'id du film ayant le meilleur score Imdb et le plus grand nombre de votes (toutes catégories confondues)
{
    let voteNumber; let idMovie; let scoreMax; let nextPage = true; 
    while (nextPage)
    {
        idBestMovie = await fetch(API_URL + "?sort_by=-imdb_score&page=" + page) 
            .then(response => response.json())
            .then(datas => 
                {
                    if (page === 1)
                        {
                            scoreMax = datas.results[0]['imdb_score'];
                            idMovie = datas.results[0]['id'];
                            voteNumber = datas.results[0]['votes'];
                        }
                    for (i=0; i<datas.results.length; i++)
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
                    return idMovie;
            
                })
            .catch(err => alert("Une erreur s'est produite", err));
            page++;
    };

};

async function getIdMovies(url, number)
// retourne les id des number films les mieux notés avec number <=10 
{
    idTab=[];
    for (page=1; page<3; page++)
    {
        await fetch(url+page)
            .then(response => response.json())
            .then(datas =>
                {   
                    if(page == 1)
                    {
                        for (i=0; i<5; i++)
                        {
                            idTab.push(datas.results[i].id);
                        }
                    }
                    else
                    {
                        for (i=0; i<number-5; i++)
                        {
                            idTab.push(datas.results[i].id);
                        }
                    }
                    return idTab;
                })
            .catch(err => alert("Une erreur s'est produite", err));
    };
};

async function getDatasMovieById(idMovie)
// retourne les données du film dont l'id est passé en paramètre
{
    datasMovie = await fetch(API_URL+idMovie) 
        .then(response => response.json())
        .then(data => 
            {
                datasMovie = {
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
                return datasMovie;
            })
        .catch(err => alert("Une erreur s'est produite", err));
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