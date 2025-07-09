namespace :db do
  namespace :seed do
    desc "Add more articles to existing database"
    task add_articles: :environment do
      raise "Attempting to seed production environment, aborting!" if Rails.env.production?

      # Get the number of articles to create from environment variable, default to 150
      target_count = ENV.fetch("TARGET_ARTICLES", 150).to_i
      current_count = Article.count
      
      if current_count >= target_count
        puts "Already have #{current_count} articles, which meets or exceeds target of #{target_count}"
        exit
      end
      
      articles_to_create = target_count - current_count
      puts "Creating #{articles_to_create} additional articles (current: #{current_count}, target: #{target_count})"
      
      # Get users to assign articles to
      users = User.all.to_a
      if users.empty?
        puts "No users found! Please run db:seed first to create users."
        exit
      end
      
      # Get tags for articles
      tags = Tag.all.to_a
      
      articles_to_create.times do |i|
        selected_tags = []
        selected_tags << "discuss" if (i % 3).zero?
        selected_tags.concat tags.sample(3).map(&:name) if tags.any?

        markdown = <<~MARKDOWN
          ---
          title: #{Faker::Book.title} #{Faker::Lorem.sentence(word_count: 2).chomp('.')}
          published: true
          cover_image: #{Faker::Company.logo}
          tags: #{selected_tags.join(', ')}
          ---

          #{Faker::Hipster.paragraph(sentence_count: 2)}
          #{Faker::Markdown.random}
          #{Faker::Hipster.paragraph(sentence_count: 2)}
        MARKDOWN

        article = Article.create!(
          body_markdown: markdown,
          featured: false,
          show_comments: true,
          user_id: users.sample.id,
        )
        
        # Add some comments to some articles
        if rand(3) == 0 # 1 in 3 chance
          rand(1..5).times do
            Comment.create!(
              body_markdown: Faker::Hipster.paragraph(sentence_count: rand(1..3)),
              user_id: users.sample.id,
              commentable_id: article.id,
              commentable_type: "Article"
            )
          end
        end
        
        print "." if (i + 1) % 10 == 0
      end
      
      puts "\nCompleted! Created #{articles_to_create} new articles."
      puts "Total articles now: #{Article.count}"
      puts "Total comments now: #{Comment.count}"
    end
  end
end
