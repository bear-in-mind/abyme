# Abyme 🕳

abyme is a modern take on handling dynamic nested forms in Rails 6+ using StimulusJS.

## Installation

Add this line to your application's Gemfile:

```ruby
gem 'abyme'
```

And then execute:

    $ bundle
    $ yarn add 'abyme'


Assuming you [already installed Stimulus](https://stimulusjs.org/handbook/introduction), add this in `app/javascript/controllers/index.js` :
```javascript
// app/javascript/controllers/index.js
import { Application } from "stimulus"
import { definitionsFromContext } from "stimulus/webpack-helpers"
// Add this line below
import { AbymeController } from 'abyme'

const application = Application.start()
const context = require.context("controllers", true, /_controller\.js$/)
application.load(definitionsFromContext(context))
// And this one
application.register('abyme', AbymeController)
```

## What are nested forms and why a new gem ?

Nested forms (or more accurately *nested fields* or *nested attributes*) are forms that deal with associated models. Let's picture a `Project` model that `has_many :tasks`. A nested form will allow you to create a project along with one or several tasks **within a single form**. If `Tasks` were to have associations on their own, like `:comments`, you could also, still in the same form, instantiate comments along with their parent models.

Rails provides [its own helper](https://api.rubyonrails.org/v6.0.1/classes/ActionView/Helpers/FormHelper.html#method-i-fields_for) to handle nested attributes. **abyme** is basically a smart wrapper around it, offering easier syntax along with some fancy additions. To work properly, some configuration will be required in both models and controllers (see below).

What Rails doesn't provide natively is the possibility to **dynamically add new associations on the fly**, which requires Javascript implementation. What this means it that you would normally have to know in advance how many fields you'd like to display (1, 2 or any number of `:tasks`), which isn't very usable in this day and age. This is what the [cocoon gem](https://github.com/nathanvda/cocoon) has been helping with for the past 7 years. This gem still being implemented in JQuery (which [Rails dropped as a dependency](https://github.com/rails/rails/issues/25208)), we wanted to propose a more plug'n'play approach, using Basecamp's [Stimulus](https://stimulusjs.org/) instead.

## Basic Configuration

### Models
Let's consider a to-do application with Projects having many Taks, themselves having many Comments.
```ruby
# models/project.rb
class Project < ApplicationRecord
  has_many :tasks, inverse_of: :project, dependent: :destroy
  validates :title, :description, presence: true
end

# models/task.rb
class Task < ApplicationRecord
  belongs_to :project
  has_many :comments, inverse_of: :task, dependent: :destroy
  validates :title, :description, presence: true
end

# models/comment.rb
class Comment < ApplicationRecord
  belongs_to :task
  validates :content, presence: true
end
```
The end-goal here is to be able to create a project along with different tasks, and immediately add comments to some of these tasks ; all within a single form.
What we'll have is a 2-level nested form. Thus, we'll need to add these lines to both `Project` and `Task` :
```ruby
# models/project.rb
class Project < ApplicationRecord
  include Abyme::Model
  #...
  abyme_for :tasks
end

# models/task.rb
class Task < ApplicationRecord
  include Abyme::Model
  #...
  abyme_for :comments
end
```

### Controller
Since we're dealing with one form, we're only concerned with one controller : the one the form routes to. In our example, this would be the `ProjectsController`.
The only configuration needed here will concern our strong params. Nested attributes require a very specific syntax to white-list the permitted attributes. It looks like this :

```ruby
def project_params
  params.require(:project).permit(
    :title, :description, tasks_attributes: [
      :id, :title, :description, :_destroy, comments_attributes: [
        :id, :content, :_destroy
      ]
    ]
  )
end
```
A few explanations here. 

* To permit a nested model attributes in your params, you'll need to pass the `association_attributes: [...]` hash at the end of your resource attributes. Key will always be `association_name` followed by `_attributes`, while the value will be an array of symbolized attributes, just like usual.

  **Note**: if your association is a singular one (`has_one` or `belongs_to`, the association will be singular ; if a Project `has_one :owner`, you would then need to pass `owner_attributes: [...]`)

* You may have remarked the presence of `id` and `_destroy` among those params. These are necessary for edit actions : if you want to allow your users to destroy or update existing records, these are **mandatory**.  Otherwise, Rails won't be able to recognize these records as existing ones, and will just create new ones. More info [here](https://api.rubyonrails.org/classes/ActiveRecord/NestedAttributes/ClassMethods.html).

## Basic Usage

Here's our form for `Project` :
```ruby
<%= simple_form_for @project do |f| %>
	<%= f.input :title %>
	<%= f.input :description %>
	<%= f.submit 'Save' %>

	<%= abymize(:participants, f, add: 'add participant') %>
  <%= abymize(:tasks, f) do |abyme| %>
    <%= abyme.records(order: {created_at: :asc}) %>
    <%= abyme.new_records(position: :end, partial: 'projects/task_fields') %>
    <%= add_association(content: '+', tag: :div) %>
  <% end %>
<% end %>
```

## Development

After checking out the repo, run `bin/setup` to install dependencies. Then, run `rake spec` to run the tests. You can also run `bin/console` for an interactive prompt that will allow you to experiment.

To install this gem onto your local machine, run `bundle exec rake install`. To release a new version, update the version number in `version.rb`, and then run `bundle exec rake release`, which will create a git tag for the version, push git commits and tags, and push the `.gem` file to [rubygems.org](https://rubygems.org).

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/[USERNAME]/abyme.

## License

The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
