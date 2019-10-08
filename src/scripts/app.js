"use strict";
let toSee = localStorage.getItem("toSee")
  ? JSON.parse(localStorage.getItem("toSee"))
  : [];
let seen = localStorage.getItem("seen")
  ? JSON.parse(localStorage.getItem("seen"))
  : [];
const getData = url => {
  return new Promise((resolve, reject) => {
    fetch(`https://garith.be/b2/tmdb/api/${url}`)
      .then(response => response.json())
      .then(data => {
        return resolve(data);
      });
  });
};
const createListItem = (parent = "movieList", itemName = "item") => {
  const item = document.createElement("li");
  item.classList.add(`${parent}__${itemName}`, `loading`);
  fadeInOut(item);
  return item;
};
const createTitle = (dataTitle, parent = "movieList") => {
  const title = document.createElement("h3");
  title.textContent = dataTitle;
  title.classList.add(`${parent}__title`);
  return title;
};
const createImage = (dataImage, parent = "movieList") => {
  const image = document.createElement("img");
  let url;
  if (dataImage === null) {
    url = "https://via.placeholder.com/150";
  } else {
    url = `http://image.tmdb.org/t/p/w500/${dataImage}`;
    parent === "movieList"
      ? url
      : parent === "categoryList"
      ? url
      : (url = `http://image.tmdb.org/t/p/original/${dataImage}`);
  }
  image.setAttribute("src", url);
  image.classList.add(`${parent}__poster`);
  return image;
};
const createLink = (parent = "movieList") => {
  const link = document.createElement("a");
  link.classList.add(`${parent}__link`);
  return link;
};
const createButton = (parent, parentItem) => {
  const addToWishlist = (id, to) => {
    let keyName;
    to === seen ? (keyName = "seen") : (keyName = "toSee");
    to.push(id);
    localStorage.setItem(keyName, JSON.stringify(to));
  };
  const removeFromWishlist = (id, from) => {
    let keyName;
    from === seen ? (keyName = "seen") : (keyName = "toSee");
    const toRemove = from.indexOf(id);
    from.splice(toRemove, 1);
    localStorage.setItem(keyName, JSON.stringify(from));
  };
  const buttonAction = (element, isOnList) => {
    const target = element.currentTarget;
    let targetParent;
    isOnList === true
      ? (targetParent = target.parentElement.parentElement.parentElement)
      : (targetParent = target.parentElement);
    const id = getMovieID(targetParent);
    const buttons = document.querySelector(".moviePage__buttons");
    buttons
      ? (fadeInOut(buttons),
        setTimeout(() => {
          buttons.remove();
        }, 400))
      : (fadeInOut(target),
        setTimeout(() => {
          target.remove();
        }, 400));
    return id;
  };
  const removeItem = id => {
    const toRemove = document.querySelector(`.movieList [data-id="${id}"]`);
    toRemove !== null &&
      (fadeInOut(toRemove),
      setTimeout(() => {
        toRemove.remove();
      }, 400));
  };
  const wishListButtons = (id, from, to) => {
    removeFromWishlist(id, from);
    addToWishlist(id, to);
    seenMovies(id);
    createButton(parent, parentItem);
  };
  let button = document.createElement("button");
  let id = getMovieID(parentItem);
  if (!toSee.includes(id) && !seen.includes(id)) {
    button.classList.add("buttonAlt", "buttonAlt--add");
    button.addEventListener("click", e => {
      id = buttonAction(e);
      addToWishlist(id, toSee);
      removeItem(id);
      createButton(parent, parentItem);
    });
  } else if (toSee.includes(id)) {
    const firstButton = createListItem(parent, "button");
    const secondButton = createListItem(parent, "button");
    const removeButton = document.createElement("button");
    const toSeeButton = document.createElement("button");
    button = document.createElement("ul");
    removeButton.classList.add("buttonAlt", "buttonAlt--remove");
    toSeeButton.classList.add("buttonAlt", "buttonAlt--toSee");
    button.classList.add(`${parent}__buttons`);
    button.appendChild(firstButton);
    button.appendChild(secondButton);
    firstButton.appendChild(removeButton);
    secondButton.appendChild(toSeeButton);
    removeButton.addEventListener("click", e => {
      id = buttonAction(e, true);
      removeFromWishlist(id, toSee);
      document.URL.includes("watchlist.html") ? removeItem(id) : seenMovies(id);
      wishlistCounter();
      createButton(parent, parentItem);
    });
    toSeeButton.addEventListener("click", e => {
      id = buttonAction(e, true);
      removeItem(id);
      wishListButtons(id, toSee, seen);
    });
  } else if (seen.includes(id)) {
    button.classList.add("buttonAlt", "buttonAlt--seen");
    button.addEventListener("click", e => {
      id = buttonAction(e);
      removeItem(id);
      wishListButtons(id, seen, toSee);
    });
  }
  parentItem.appendChild(button);
  fadeInOut(button);
  return button;
};
const movieItem = (title, image, id, parent = "movieList") => {
  const link = createLink(parent);
  title = createTitle(title, parent);
  image = createImage(image, parent);
  if (parent === "movieList") {
    const movieListItem = createListItem(parent);
    movieListItem.classList.add(`${parent}__item`);
    movieListItem.setAttribute("data-id", id);
    const button = createButton(parent, movieListItem);
    parent = document.querySelector(`.${parent}`);
    parent.appendChild(movieListItem);
    parent = movieListItem;
    parent.appendChild(button);
  } else {
    parent = document.querySelector(`.${parent}`);
    parent.setAttribute("data-id", id);
  }
  parent.appendChild(link);
  parent.appendChild(title);
  parent.appendChild(image);
  link.addEventListener("click", e => {
    const target = e.currentTarget;
    const id = getMovieID(target.parentElement);
    const overlay = document.querySelector(".section--moviePage");
    const container = document.createElement("div");
    const overview = document.createElement("p");
    const button = document.createElement("button");
    overlay.textContent = "";
    button.classList.add("backButton");
    button.textContent = "fermer";
    overlay.classList.add("section--open");
    container.setAttribute("data-id", id);
    container.classList.add("moviePage");
    document.body.classList.add("scrollLock");
    container.appendChild(button);
    button.addEventListener("click", () => {
      container.remove();
      overlay.classList.remove("section--open");
      document.body.classList.remove("scrollLock");
    });
    getData(`movie/${id}&language=FR-fr`).then(data => {
      const parent = container.getAttribute("class");
      const image = createImage(data.backdrop_path, parent);
      const title = createTitle(data.title, parent);
      const poster = createImage(data.poster_path, parent);
      const rating = document.createElement("span");
      const titleBlock = document.createElement("div");
      const release = document.createElement("span");
      poster.classList.replace(`${parent}__poster`, `${parent}__image`);
      titleBlock.classList.add(`${parent}__titleBlock`);
      rating.classList.add(`${parent}__rating`);
      release.classList.add(`${parent}__release`);
      overview.textContent = data.overview;
      rating.textContent = data.vote_average;
      release.textContent = `Sortie le ${data.release_date}`;
      container.appendChild(poster);
      container.appendChild(image);
      titleBlock.appendChild(title);
      titleBlock.appendChild(rating);
      container.appendChild(titleBlock);
      container.appendChild(overview);
      container.appendChild(release);
      createButton(parent, container);
    });
    overlay.appendChild(container);
  });
  return parent;
};
const createMovieList = path => {
  path.forEach(element => {
    const item = movieItem(element.title, element.poster_path, element.id);
    const id = getMovieID(item);
    !toSee.includes(id) ? toSee : item.remove();
    !seen.includes(id) ? seen : item.remove();
  });
};
const getMovieID = item => {
  return item.getAttribute("data-id");
};
const seenMovies = id => {
  getData(`movie/${id}&language=FR-fr`).then(data => {
    let movieList = document.querySelectorAll(".movieList");
    const item = movieItem(data.title, data.poster_path, data.id);
    if (document.URL.includes("watchlist.html")) {
      toSee.includes(id)
        ? (movieList = movieList[0])
        : seen.includes(id)
        ? (movieList = movieList[1])
        : false;
      movieList.appendChild(item);
    } else {
      toSee.includes(id) || seen.includes(id) ? item.remove() : false;
    }
  });
  wishlistCounter();
};
const wishlistCounter = () => {
  if (document.URL.includes("watchlist.html")) {
    const seenCounter = document.querySelector(".counter__seen");
    const toSeeCounter = document.querySelector(".counter__toSee");
    seenCounter.textContent = seen.length;
    toSeeCounter.textContent = toSee.length;
  }
};
const fadeInOut = element => {
  element.classList.add("loading");
  setTimeout(() => {
    element.classList.remove("loading");
  }, 400);
};
if (document.URL.includes("index.html")) {
  const popularMovie = document.querySelector(".popularMovie");
  fadeInOut(popularMovie);
  getData("trending/movie/day&language=FR-fr").then(data => {
    data = data.results[0];
    movieItem(data.title, data.backdrop_path, data.id, "popularMovie");
  });
  getData("movie/now_playing&language=FR-fr").then(data => {
    data = data.results;
    createMovieList(data);
  });
  const filterButtons = document.querySelectorAll(".button");
  filterButtons.forEach(element => {
    element.addEventListener("click", () => {
      const target = element.getAttribute("data-filter");
      const buttonActivated = document.querySelector(".button--activated");
      const movieList = document.querySelector(".movieList");
      fadeInOut(movieList);
      buttonActivated.classList.remove("button--activated");
      element.classList.add("button--activated");
      getData(`movie/${target}&language=FR-fr`).then(data => {
        data = data.results;
        setTimeout(() => {
          movieList.textContent = "";
          createMovieList(data);
        }, 50);
      });
    });
  });
}
if (document.URL.includes("watchlist.html")) {
  wishlistCounter();
  toSee.forEach(element => {
    getData(`movie/${element}&language=FR-fr`).then(data => {
      movieItem(data.title, data.poster_path, data.id);
    });
  });
  seen.forEach(element => {
    seenMovies(element);
  });
}
if (document.URL.includes("search.html")) {
  const search = document.querySelector(".search__input");
  search.addEventListener("input", () => {
    const searchList = document.querySelector(".movieList");
    setTimeout(() => {
      const searchValue = search.value;
      getData(`search/movie&query=${searchValue}&language=FR-fr`).then(data => {
        data = data.results;
        searchList.textContent = "";
        if (data !== undefined) {
          data = data.slice(0, 20);
          createMovieList(data);
        }
      });
    }, 300);
  });
  const categoryList = document.querySelector(".categoryList");
  fetch("category.json", {
    mode: "cors",
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  })
    .then(response => response.json())
    .then(data => {
      data.forEach(element => {
        const item = createListItem("categoryList");
        const link = createLink("categoryList");
        const title = createTitle(element.name, "categoryList");
        const id = element.id;
        categoryList.appendChild(item);
        item.appendChild(link);
        item.appendChild(title);
        item.setAttribute("data-id", id);
        getData(`discover/movie?with_genres=${id}&language=FR-fr`).then(
          data => {
            const random = Math.floor(Math.random() * (19 - 0)) + 0;
            const results = data.results[random];
            const image = createImage(results.backdrop_path, "categoryList");
            item.appendChild(image);
          }
        );
        link.addEventListener("click", e => {
          const title = document.querySelector(".section--category .title");
          const target = e.currentTarget;
          const parent = target.parentElement;
          const id = parent.getAttribute("data-id");
          title.textContent = element.name;
          getData(`discover/movie?with_genres=${id}&language=FR-fr`).then(
            data => {
              let genreArea = document.querySelector(".section--category");
              const movieList = genreArea.querySelector(".movieList");
              data = data.results;
              createMovieList(data);
              const items = document.querySelectorAll(".movieList__item");
              items.forEach(element => {
                movieList.appendChild(element);
              });
              const button = document.createElement("button");
              button.classList.add("backButton");
              button.textContent = "fermer";
              genreArea.appendChild(button);
              button.addEventListener("click", () => {
                movieList.textContent = "";
                button.remove();
                genreArea.classList.remove("section--open");
                document.body.classList.remove("scrollLock");
              });
              genreArea.classList.add("section--open");
            }
          );
        });
      });
    });
}
