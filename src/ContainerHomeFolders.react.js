var _ = require('underscore');
var React = require('react/addons');
var RetinaImage = require('react-retina-image');
var path = require('path');
var shell = require('shell');
var util = require('./Util');
var metrics = require('./Metrics');
var ContainerStore = require('./ContainerStore');

var ContainerHomeFolder = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },
  handleClickFolder: function (hostVolume, containerVolume) {
    metrics.track('Opened Volume Directory', {
      from: 'home'
    });

    if (hostVolume.indexOf(process.env.HOME) === -1) {
      var volumes = _.clone(this.props.container.Volumes);
      var newHostVolume = path.join(util.home(), 'Kitematic', this.props.container.Name, containerVolume);
      volumes[containerVolume] = newHostVolume;
      var binds = _.pairs(volumes).map(function (pair) {
        return pair[1] + ':' + pair[0];
      });
      ContainerStore.updateContainer(this.props.container.Name, {
        Binds: binds
      }, function (err) {
        if (err) {
          console.log(err);
          return;
        }
        shell.showItemInFolder(newHostVolume);
      });
    } else {
      shell.showItemInFolder(hostVolume);
    }
  },
  handleClickChangeFolders: function () {
    metrics.track('Viewed Volume Settings', {
      from: 'preview'
    });
    this.context.router.transitionTo('containerSettingsVolumes', {name: this.context.router.getCurrentParams().name});
  },
  render: function () {
    if (!this.props.container) {
      return false;
    }

    var folders = _.map(this.props.container.Volumes, (val, key) => {
      var firstFolder = key.split(path.sep)[1];
      return (
        <div key={key} className="folder" onClick={this.handleClickFolder.bind(this, val, key)}>
          <RetinaImage src="folder.png" />
          <div className="text">{firstFolder}</div>
        </div>
      );
    });

    if (this.props.container.Volumes && _.keys(this.props.container.Volumes).length > 0 && this.props.container.State.Running) {
      return (
        <div className="folders wrapper">
          <h4>Edit Files</h4>
          <div className="widget">
            {folders}
          </div>
          <div className="subtext" onClick={this.handleClickChangeFolders}>Change Folders</div>
        </div>
      );
    } else {
      return false;
    }
  }
});

module.exports = ContainerHomeFolder;
