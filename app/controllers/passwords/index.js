import Ember from 'ember';

export default Ember.ArrayController.extend({
    allTags: Ember.computed('@each.tags', function () {
        var allTags = [];
        this.forEach(function (password) {
            var tags = password.get('tags');
            allTags = allTags.concat(tags);
        });
        return allTags.uniq();
    })
});
