(function(){
  const imageMap = {
    'blueberry': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031519-01-d433912b.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031519-02-1e557965.webp'
    ],
    'avocado': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031520-03-77e29826.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031520-04-5238aadc.webp'
    ],
    'cherry': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031521-05-a1c3cb59.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031522-06-fe4a373e.webp'
    ],
    'asian-pear': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031522-07-864f700c.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031523-08-e4ff83fe.webp'
    ],
    'apple': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031523-09-6915d149.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031524-10-833b7267.webp'
    ],
    'pomegranate': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031524-11-e8312cf9.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031525-12-5a474f1b.webp'
    ],
    'kiwi': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031526-13-5bcb2b5b.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031526-14-e1722b4d.webp'
    ],
    'shine-muscat': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031527-15-7e86a957.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031527-16-76ce41d8.webp'
    ],
    'mango': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031528-17-554a81d6.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031528-18-c2666f75.webp'
    ],
    'mandarin': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031528-19-87aca346.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031529-20-b4c7223a.webp'
    ],
    'banana': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031557-21-724806c4.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031557-22-024b91db.webp'
    ],
    'persimmon': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031558-23-1ac6bbb1.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031558-24-4d15c4f7.webp'
    ],
    'table-grape': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031559-25-5cc8171e.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031600-26-12f8e3e3.webp'
    ],
    'peach': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031600-27-1f90792a.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031600-28-bc7bd0f6.webp'
    ],
    'plum': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031601-29-74a827a1.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031602-30-dbe7030e.webp'
    ],
    'pineapple': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031602-31-bb93a75b.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031603-32-b685febb.webp'
    ],
    'nectarine': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031603-33-3547da73.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031604-34-e0589f75.webp'
    ],
    'strawberry': [
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031604-35-3b6c96e3.webp',
      'https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20260913-031604-36-c2ace151.webp'
    ]
  };

  window.TERRASAVE_FRUIT_IMAGES = imageMap;
  (window.TERRASAVE_FRUITS || []).forEach((fruit) => {
    const pair = imageMap[fruit.slug];
    if (!pair) return;
    fruit.imageWhole = pair[0];
    fruit.imageCut = pair[1];
  });
})();
