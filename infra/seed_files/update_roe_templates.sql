-- Update RoE Templates to use composition approach
-- Content now comes from RoeSectionTemplate, these specify which sections and order

-- Network Penetration Test Template - Comprehensive template with all sections
UPDATE RoeTemplate 
SET sections = JSON_ARRAY(
    JSON_OBJECT(
        'type', 'AUTHORIZATION',
        'position', 0,
        'overrides', JSON_OBJECT(
            'title', 'Network Testing Authorization'
        )
    ),
    JSON_OBJECT(
        'type', 'SCOPE',
        'position', 1,
        'overrides', JSON_OBJECT(
            'title', 'Network Scope Definition'
        )
    ),
    JSON_OBJECT(
        'type', 'TESTING_WINDOW',
        'position', 2,
        'overrides', JSON_OBJECT(
            'title', 'Network Testing Schedule'
        )
    ),
    JSON_OBJECT(
        'type', 'METHODOLOGY',
        'position', 3,
        'overrides', JSON_OBJECT(
            'title', 'Network Testing Methodology'
        )
    ),
    JSON_OBJECT(
        'type', 'RESTRICTIONS',
        'position', 4,
        'overrides', JSON_OBJECT(
            'title', 'Network Testing Restrictions'
        )
    ),
    JSON_OBJECT(
        'type', 'COMMUNICATION',
        'position', 5
    ),
    JSON_OBJECT(
        'type', 'EMERGENCY',
        'position', 6
    ),
    JSON_OBJECT(
        'type', 'LEGAL',
        'position', 7
    )
)
WHERE name = 'Network Penetration Test Template';

-- Web Application Security Template - Focused on application testing
UPDATE RoeTemplate 
SET sections = JSON_ARRAY(
    JSON_OBJECT(
        'type', 'AUTHORIZATION',
        'position', 0,
        'overrides', JSON_OBJECT(
            'title', 'Web Application Testing Authorization'
        )
    ),
    JSON_OBJECT(
        'type', 'SCOPE',
        'position', 1,
        'overrides', JSON_OBJECT(
            'title', 'Application Scope Definition'
        )
    ),
    JSON_OBJECT(
        'type', 'TESTING_WINDOW',
        'position', 2,
        'overrides', JSON_OBJECT(
            'title', 'Application Testing Schedule'
        )
    ),
    JSON_OBJECT(
        'type', 'METHODOLOGY',
        'position', 3,
        'overrides', JSON_OBJECT(
            'title', 'Web Application Testing Methodology'
        )
    ),
    JSON_OBJECT(
        'type', 'RESTRICTIONS',
        'position', 4,
        'overrides', JSON_OBJECT(
            'title', 'Application Testing Restrictions'
        )
    ),
    JSON_OBJECT(
        'type', 'COMMUNICATION',
        'position', 5
    )
)
WHERE name = 'Web Application Security Template';

-- Cloud Security Assessment Template - Cloud-specific sections
UPDATE RoeTemplate 
SET sections = JSON_ARRAY(
    JSON_OBJECT(
        'type', 'AUTHORIZATION',
        'position', 0,
        'overrides', JSON_OBJECT(
            'title', 'Cloud Security Assessment Authorization'
        )
    ),
    JSON_OBJECT(
        'type', 'SCOPE',
        'position', 1,
        'overrides', JSON_OBJECT(
            'title', 'Cloud Infrastructure Scope'
        )
    ),
    JSON_OBJECT(
        'type', 'TESTING_WINDOW',
        'position', 2,
        'overrides', JSON_OBJECT(
            'title', 'Cloud Assessment Schedule'
        )
    ),
    JSON_OBJECT(
        'type', 'METHODOLOGY',
        'position', 3,
        'overrides', JSON_OBJECT(
            'title', 'Cloud Security Methodology'
        )
    ),
    JSON_OBJECT(
        'type', 'RESTRICTIONS',
        'position', 4,
        'overrides', JSON_OBJECT(
            'title', 'Cloud Assessment Restrictions'
        )
    ),
    JSON_OBJECT(
        'type', 'LEGAL',
        'position', 5,
        'overrides', JSON_OBJECT(
            'title', 'Cloud Compliance & Legal'
        )
    )
)
WHERE name = 'Cloud Security Assessment Template';