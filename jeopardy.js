class JeopardyBoard {
  constructor(cats = 5) {
    this.cats = cats;
    this.seedArr = this.seed();
    this.catIds = [];
    this.categories = [];
    this.fillTable();
    this.handleClick();
  }

  seed() {
    let arr = [];
    for (let i = 0; i < this.cats; i++) {
      let num = Math.floor(Math.random() * 11000);
      arr.push(num);
    }
    return arr;
  }

  async getCategoryIds() {
    for (let seed of this.seedArr) {
      const res = await axios.get(
        `http://jservice.io/api/categories?count=1&offset=${seed}`
      );
      this.catIds.push(res.data[0].id);
    }
  }

  async createCategories() {
    await this.getCategoryIds();
    for (let catId of this.catIds) {
      this.categories.push(await this.getCategory(catId));
    }
  }

  async getCategory(catId) {
    let catArr = {};
    const res = await axios.get(`http://jservice.io/api/category?id=${catId}`);
    catArr.title = res.data.title;
    catArr.clues = this.getClues(res);
    return catArr;
  }

  getClues(arr) {
    let clueArr = [];
    let clueIds = [];
    while (clueArr.length < 5) {
      const num = Math.floor(Math.random() * (clueArr.length + 1));
      const clueObj = {};
      clueObj.question = arr.data.clues[num].question;
      clueObj.answer = arr.data.clues[num].answer;
      clueObj.showing = "?";
      const clueId = arr.data.clues[num].id;
      if (clueIds.indexOf(clueId) === -1) {
        clueIds.push(clueId);
        clueArr.push(clueObj);
      }
    }
    return clueArr;
  }

  async fillTable() {
    await this.createCategories();
    this.tableHead();
    this.tableBody();
  }

  tableHead() {
    let $tRow = $("<tr>");
    for (let i = 0; i < this.categories.length; i++) {
      let title = this.categories[i].title;
      let $th = $("<th>").html(`<p>${title}</p>`);
      $tRow.append($th);
    }
    $("thead").append($tRow);
  }

  tableBody() {
    const categories = this.categories;
    for (let i = 0; i < categories[0].clues.length; i++) {
      let $tRow = $("<tr>");
      for (let j = 0; j < categories.length; j++) {
        let $td = $("<td>")
          .html("<p> ? </p>")
          .attr("data-x", i)
          .attr("data-y", j)
          .attr("data-showing", categories[j].clues[i].showing);
        $tRow.append($td);
      }
      $("tbody").append($tRow);
    }
  }

  handleClick() {
    const categories = this.categories;
    $("tbody").on("click", "td", function (e) {
      let x = e.target.dataset.x;
      console.log(x);
      let y = e.target.dataset.y;
      console.log(y);
      if (e.target.dataset.showing === "?") {
        categories[y].clues[x].showing = "question";
        e.target.dataset.showing = "question";
        let q = categories[y].clues[x].question;
        e.target.innerHTML = `<p>${q}</p>`;
      } else if (e.target.dataset.showing === "question") {
        categories[y].clues[x].showing = "answer";
        e.target.dataset.showing = "answer";
        let a = categories[y].clues[x].answer;
        e.target.innerHTML = `<p>${a}</p>`;
      }
    });
    $("tbody").on("click", "p", function (e) {
      let x = e.target.parentElement.dataset.x;
      console.log(x);
      let y = e.target.parentElement.dataset.y;
      console.log(y);

      if (e.target.parentElement.dataset.showing === "?") {
        categories[y].clues[x].showing = "question";
        e.target.parentElement.dataset.showing = "question";
        let q = categories[y].clues[x].question;
        e.target.parentElement.innerHTML = `<p>${q}</p>`;
      } else if (e.target.parentElement.dataset.showing === "question") {
        categories[y].clues[x].showing = "answer";
        e.target.parentElement.dataset.showing = "answer";
        let a = categories[y].clues[x].answer;
        e.target.parentElement.innerHTML = `<p>${a}</p>`;
      }
    });
  }
}
new JeopardyBoard();

$("#restart").on("click", function () {
  $("thead").html("");
  $("tbody").html("");
  new JeopardyBoard();
});
