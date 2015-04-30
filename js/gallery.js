/*
  gallery.js
  Creates a slideshow in #gallery-react
  Structure:
  .gallery-previews>.gallery-preview*x>h2+img
  .gallery-slider>.gallery-slide*y>img
  Each gallery(x) gets its own preview element but there's only one slider for all of the galleries
  The slider shows images(y) for the selected gallery(x)
  State is maintained in the gallery class
*/
/*global React*/
var galleryPreviews = React.createClass({
  propTypes: {
    galleries: React.PropTypes.array,
    selectGallery: React.PropTypes.func
  },
  render: function() {
    var galleryNodes = this.props.galleries.map(function(galleryData, index) {
      return React.createElement('div', {
          key: index,
          className: 'gallery-preview',
          onClick: this.handleClick.bind(this, index)
        },
        React.createElement('h2', {}, galleryData.title),
        React.createElement('img', {
          src: galleryData.images[0]
        }));
    }.bind(this));
    return React.createElement('div', {
      className: 'gallery-previews'
    }, galleryNodes);
  },
  handleClick: function(index) {
    this.props.selectGallery(index);
  }
});

var gallerySlider = React.createClass({
  propTypes: {
    images: React.PropTypes.array,
    sliderActive: React.PropTypes.bool,
    currentSlide: React.PropTypes.number,
    selectSlide: React.PropTypes.func,
    closeGallery: React.PropTypes.func
  },
  render: function() {
    var slideClasses = {
      'gallery-slide': true,
      'past': false,
      'future': false
    };
    var sliderClasses = {
      'gallery-slider': true,
      'active': this.props.sliderActive,
      'start': this.props.currentSlide === 0 ? true : false,
      'end': this.props.currentSlide === this.props.images.length - 1 ? true : false
    };
    var gallerySlides = this.props.images.map(function(image, index) {
      slideClasses.past = index < this.props.currentSlide ? true : false;
      slideClasses.future = index > this.props.currentSlide ? true : false;
      // Lazy load images within 3 of current
      return React.createElement('div', {
          key: index,
          className: this.classConcat(slideClasses)
        },
        React.createElement('img', {
          src: Math.abs(this.props.currentSlide - index) <= 3 ? image : ''
        }));
    }.bind(this));
    return React.createElement('div', {
        className: this.classConcat(sliderClasses)
      }, gallerySlides,
      React.createElement('div', {
        className: 'prev',
        onClick: this.handleClickPrevious
      }),
      React.createElement('div', {
        className: 'next',
        onClick: this.handleClickNext
      }),
      React.createElement('div', {
        className: 'close',
        onClick: this.handleClickClose
      }));
  },
  handleClickNext: function() {
    this.props.selectSlide(this.props.currentSlide + 1);
  },
  handleClickPrevious: function() {
    this.props.selectSlide(this.props.currentSlide - 1);
  },
  handleClickClose: function() {
    this.props.closeGallery();
  },
  // Light replacement for React.addons.classSet due to depreciation
  classConcat: function(classObject) {
    var classes = '';
    for (var className in classObject) {
      if (classObject[className]) classes += ' ' + className;
    }
    // returns a string of classes minus the leading space
    return classes.substr(1);
  }
});

var gallery = React.createClass({
  propTypes: {
    fileUrl: React.PropTypes.string
  },
  componentDidMount: function() {
    this.fetchJSONFile(this.props.fileUrl, function(data) {
      this.setState({
        galleries: data
      });
    }.bind(this));
  },
  getInitialState: function() {
    return {
      galleries: [],
      images: [],
      sliderActive: false,
      currentGallery: 0,
      currentSlide: 0
    };
  },
  render: function() {
    return React.createElement('div', {},
      React.createElement(galleryPreviews, {
        galleries: this.state.galleries,
        selectGallery: this.selectGallery
      }),
      React.createElement(gallerySlider, {
        images: this.state.images,
        sliderActive: this.state.sliderActive,
        currentSlide: this.state.currentSlide,
        selectSlide: this.selectSlide,
        closeGallery: this.closeGallery
      }));
  },
  selectGallery: function(index) {
    // If the user has selected a different gallery reset the current slide/slider position
    if (this.state.currentGallery !== index) {
      this.setState({
        currentGallery: index,
        currentSlide: 0
      });
    }
    this.setState({
      images: this.state.galleries[index].images,
      sliderActive: true
    });
  },
  selectSlide: function(index) {
    if (index >= 0 && index < this.state.images.length) {
      this.setState({
        currentSlide: index
      });
    }
  },
  closeGallery: function() {
    this.setState({
      sliderActive: false
    });
  },
  // Generic XHR request plus a json parse
  fetchJSONFile: function(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          var data = JSON.parse(httpRequest.responseText);
          if (callback) callback(data);
        }
      }
    };
    httpRequest.open('GET', path);
    httpRequest.send();
  }
});


React.render(
  React.createElement(gallery, {
    fileUrl: 'galleries.json'
  }),
  document.getElementById('gallery-react')
);